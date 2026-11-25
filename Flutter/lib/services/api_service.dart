import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/product.dart';

class ApiException implements Exception {
  final String message;
  const ApiException(this.message);

  @override
  String toString() => message;
}

class ApiService {
  // Home Wi-Fi IP of the laptop running the CampusCart backend.
  // Change this one line if the laptop gets a different IPv4 address.
  static const String baseUrl = 'http://192.168.0.139:5000/api';

  static const Duration timeout = Duration(seconds: 12);

  Future<void> saveSession(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('campuscart_auth_token', '${data['token']}');
    await prefs.setString('campuscart_user', jsonEncode(data['user']));
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('campuscart_auth_token');
  }

  Future<Map<String, dynamic>?> getSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('campuscart_user');

    if (raw == null) return null;

    try {
      return Map<String, dynamic>.from(jsonDecode(raw));
    } catch (_) {
      return null;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('campuscart_auth_token');
    await prefs.remove('campuscart_user');
  }

  Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    final data = await _request(
      'POST',
      '/auth/login',
      body: {
        'email': email.trim().toLowerCase(),
        'password': password,
      },
    );

    await saveSession(data);
    return data;
  }

  Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String phone,
    required String university,
    required String password,
  }) async {
    final data = await _request(
      'POST',
      '/auth/register',
      body: {
        'fullName': fullName.trim(),
        'email': email.trim().toLowerCase(),
        'phone': phone.trim(),
        'university': university.trim(),
        'password': password,
      },
    );

    await saveSession(data);
    return data;
  }

  Future<List<Product>> fetchProducts() async {
    final data = await _request('GET', '/products', auth: true);
    final items = (data['data'] as List? ?? []);

    return items
        .map((item) => Product.fromJson(Map<String, dynamic>.from(item)))
        .where((product) => product.status != 'sold')
        .toList();
  }

  Future<Product> createProduct({
    required String title,
    required String description,
    required String category,
    required double price,
    required String condition,
    required String meetupSpot,
  }) async {
    final data = await _request(
      'POST',
      '/products',
      auth: true,
      body: {
        'title': title.trim(),
        'description': description.trim(),
        'category': category,
        'price': price,
        'condition': condition,
        'campusLocation': meetupSpot,
      },
    );

    return Product.fromJson(
      Map<String, dynamic>.from(data['data']),
    );
  }

  Future<void> saveLocalOrder(Product product) async {
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getStringList('campuscart_orders') ?? [];
    existing.add(jsonEncode({
      'createdAt': DateTime.now().toIso8601String(),
      'product': product.toJson(),
    }));
    await prefs.setStringList('campuscart_orders', existing);
  }

  Future<List<Map<String, dynamic>>> getLocalOrders() async {
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getStringList('campuscart_orders') ?? [];
    return existing.map((item) {
      try {
        return Map<String, dynamic>.from(jsonDecode(item));
      } catch (_) {
        return <String, dynamic>{};
      }
    }).where((item) => item.isNotEmpty).toList();
  }

  Future<Product> buyProduct(String productId) async {
    final data = await _request(
      'PUT',
      '/products/$productId',
      auth: true,
      body: {'status': 'sold'},
    );

    return Product.fromJson(
      Map<String, dynamic>.from(data['data']),
    );
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    bool auth = false,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };

    if (auth) {
      final token = await getToken();

      if (token == null || token.isEmpty) {
        throw const ApiException(
          'Your session expired. Please sign in again.',
        );
      }

      headers['Authorization'] = 'Bearer $token';
    }

    try {
      late http.Response response;

      if (method == 'GET') {
        response = await http
            .get(uri, headers: headers)
            .timeout(timeout);
      } else if (method == 'PUT') {
        response = await http
            .put(
              uri,
              headers: headers,
              body: jsonEncode(body ?? {}),
            )
            .timeout(timeout);
      } else {
        response = await http
            .post(
              uri,
              headers: headers,
              body: jsonEncode(body ?? {}),
            )
            .timeout(timeout);
      }

      Map<String, dynamic> data = {};

      try {
        data = Map<String, dynamic>.from(
          jsonDecode(response.body),
        );
      } catch (_) {}

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw ApiException(
          '${data['message'] ?? 'Request failed'}',
        );
      }

      return data;
    } on ApiException {
      rethrow;
    } catch (_) {
      throw const ApiException(
        'Cannot connect to CampusCart server. Make sure the backend is running and the phone and laptop are on the same Wi-Fi.',
      );
    }
  }
}
