import 'package:flutter/material.dart';

import '../services/api_service.dart';
import '../widgets/app_button.dart';

class SellScreen extends StatefulWidget {
  const SellScreen({super.key});

  @override
  State<SellScreen> createState() => _SellScreenState();
}

class _SellScreenState extends State<SellScreen> {
  final title = TextEditingController();
  final desc = TextEditingController();
  final price = TextEditingController();
  final api = ApiService();

  String category = 'Accessories';
  String condition = 'Good';
  String meetup = 'Admin Block';
  bool loading = false;

  Future<void> save() async {
    final parsedPrice = double.tryParse(price.text.trim());

    if (title.text.trim().isEmpty ||
        desc.text.trim().isEmpty ||
        parsedPrice == null ||
        parsedPrice <= 0) {
      _error('Enter a title, description and valid price.');
      return;
    }

    setState(() => loading = true);

    try {
      await api.createProduct(
        title: title.text,
        description: desc.text,
        category: category,
        price: parsedPrice,
        condition: condition,
        meetupSpot: meetup,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Listing published successfully.'),
        ),
      );

      Navigator.pop(context);
    } catch (e) {
      if (mounted) _error(e.toString());
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  void _error(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sell an item')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text(
              'Create a listing',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 7),
            Text(
              'Add enough detail so another student can trust the listing.',
              style: TextStyle(color: Colors.grey.shade700),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: title,
              decoration: const InputDecoration(
                labelText: 'Product title',
                prefixIcon: Icon(Icons.sell_outlined),
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: desc,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Description',
                alignLabelWithHint: true,
                prefixIcon: Icon(Icons.notes_outlined),
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: price,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: const InputDecoration(
                labelText: 'Price (₹)',
                prefixIcon: Icon(Icons.currency_rupee),
              ),
            ),
            const SizedBox(height: 14),
            _drop(
              'Category',
              category,
              [
                'Accessories',
                'Electronics',
                'Books',
                'Fashion',
                'Hostel',
                'Sports',
              ],
              (value) => setState(() => category = value!),
            ),
            const SizedBox(height: 14),
            _drop(
              'Condition',
              condition,
              ['New', 'Like New', 'Good', 'Fair'],
              (value) => setState(() => condition = value!),
            ),
            const SizedBox(height: 14),
            _drop(
              'Meetup spot',
              meetup,
              [
                'Admin Block',
                'Fountain',
                'Ground',
                'D Block',
                'L Block',
                'DSA',
              ],
              (value) => setState(() => meetup = value!),
            ),
            const SizedBox(height: 26),
            AppButton(
              label: 'Publish listing',
              onPressed: save,
              loading: loading,
            ),
          ],
        ),
      ),
    );
  }

  Widget _drop(
    String label,
    String value,
    List<String> values,
    ValueChanged<String?> onChanged,
  ) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      decoration: InputDecoration(labelText: label),
      items: values
          .map(
            (item) => DropdownMenuItem(
              value: item,
              child: Text(item),
            ),
          )
          .toList(),
      onChanged: onChanged,
    );
  }
}
