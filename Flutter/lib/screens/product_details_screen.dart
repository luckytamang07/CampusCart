import 'package:flutter/material.dart';

import '../models/product.dart';
import '../services/api_service.dart';

class ProductDetailsScreen extends StatefulWidget {
  final Product product;

  const ProductDetailsScreen({
    super.key,
    required this.product,
  });

  @override
  State<ProductDetailsScreen> createState() =>
      _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  final api = ApiService();
  bool buying = false;

  Future<void> buy() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm purchase'),
        content: Text(
          'Request to buy ${widget.product.title} for ₹${widget.product.price.toStringAsFixed(0)}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Buy'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => buying = true);

    try {
      await api.buyProduct(widget.product.id);
      await api.saveLocalOrder(widget.product);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Purchase request completed successfully.'),
        ),
      );

      Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => buying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Product Details'),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 14),
          child: FilledButton.icon(
            onPressed: buying ? null : buy,
            icon: buying
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.shopping_cart_outlined),
            label: Text(
              buying
                  ? 'Processing...'
                  : 'Buy for ₹${product.price.toStringAsFixed(0)}',
            ),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 12, 18, 20),
        children: [
          Container(
            height: 210,
            decoration: BoxDecoration(
              color: Theme.of(context)
                  .colorScheme
                  .primaryContainer,
              borderRadius: BorderRadius.circular(24),
            ),
            child: product.imageUrl != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Image.network(
                      product.imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _icon(),
                    ),
                  )
                : _icon(),
          ),

          const SizedBox(height: 22),

          Text(
            product.title,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),

          const SizedBox(height: 8),

          Text(
            '₹${product.price.toStringAsFixed(0)}',
            style: TextStyle(
              fontSize: 25,
              fontWeight: FontWeight.w900,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),

          const SizedBox(height: 18),

          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _tag(product.category),
              _tag(product.condition),
              _tag(product.meetupSpot),
            ],
          ),

          const SizedBox(height: 24),

          const Text(
            'Description',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),

          const SizedBox(height: 8),

          Text(
            product.description,
            style: TextStyle(
              height: 1.5,
              color: Colors.grey.shade700,
            ),
          ),

          const SizedBox(height: 24),

          const Text(
            'Seller',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),

          const SizedBox(height: 10),

          Card(
            child: ListTile(
              leading: CircleAvatar(
                child: Text(
                  product.sellerName.isEmpty
                      ? 'S'
                      : product.sellerName[0].toUpperCase(),
                ),
              ),
              title: Row(
                children: [
                  Flexible(
                    child: Text(
                      product.sellerName.isEmpty
                          ? 'Campus seller'
                          : product.sellerName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  if (product.sellerVerified)
                    const Padding(
                      padding: EdgeInsets.only(left: 5),
                      child: Icon(
                        Icons.verified,
                        size: 18,
                      ),
                    ),
                ],
              ),
              subtitle: Text(
                product.sellerUniversity.isEmpty
                    ? 'CampusCart student'
                    : product.sellerUniversity,
              ),
            ),
          ),

          const SizedBox(height: 18),

          Card(
            child: ListTile(
              leading: const Icon(Icons.location_on_outlined),
              title: const Text('Meetup location'),
              subtitle: Text(product.meetupSpot),
            ),
          ),
        ],
      ),
    );
  }

  Widget _icon() {
    return Center(
      child: Icon(
        Icons.shopping_bag_outlined,
        size: 80,
        color: Theme.of(context).colorScheme.primary,
      ),
    );
  }

  Widget _tag(String value) {
    return Chip(
      label: Text(value),
      visualDensity: VisualDensity.compact,
    );
  }
}
