class Product {
  final String id;
  final String title;
  final String description;
  final String category;
  final double price;
  final String condition;
  final String meetupSpot;
  final String? imageUrl;
  final String sellerName;
  final String sellerUniversity;
  final bool sellerVerified;
  final String status;

  const Product({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.price,
    required this.condition,
    required this.meetupSpot,
    this.imageUrl,
    this.sellerName = '',
    this.sellerUniversity = '',
    this.sellerVerified = false,
    this.status = 'active',
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'category': category,
    'price': price,
    'condition': condition,
    'campusLocation': meetupSpot,
    'imageUrl': imageUrl,
    'sellerName': sellerName,
    'sellerUniversity': sellerUniversity,
    'sellerVerified': sellerVerified,
    'status': status,
  };

  factory Product.fromJson(Map<String, dynamic> json) {
    final images = json['images'];
    String? image;
    if (images is List && images.isNotEmpty) {
      image = images.first?.toString();
    }

    return Product(
      id: '${json['_id'] ?? json['id'] ?? ''}',
      title: '${json['title'] ?? ''}',
      description: '${json['description'] ?? ''}',
      category: '${json['category'] ?? ''}',
      price: double.tryParse('${json['price'] ?? 0}') ?? 0,
      condition: '${json['condition'] ?? ''}',
      meetupSpot: '${json['campusLocation'] ?? json['meetupSpot'] ?? ''}',
      imageUrl: json['imageUrl']?.toString() ?? image,
      sellerName: '${json['sellerName'] ?? ''}',
      sellerUniversity: '${json['sellerUniversity'] ?? ''}',
      sellerVerified: json['sellerVerified'] == true,
      status: '${json['status'] ?? 'active'}',
    );
  }
}
