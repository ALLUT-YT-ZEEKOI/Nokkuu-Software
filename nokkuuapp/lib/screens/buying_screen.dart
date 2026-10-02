import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class BuyingScreen extends StatefulWidget {
  const BuyingScreen({Key? key}) : super(key: key);

  @override
  State<BuyingScreen> createState() => _BuyingScreenState();
}

class _BuyingScreenState extends State<BuyingScreen> {
  List<dynamic> _items = [];
  Map<String, dynamic> _summary = {'total_estimated_budget': 0.0};
  bool _loading = true;
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Vehicle',
    'Jewelry',
    'Food & Dining',
    'Life Ambition',
    'Tech',
    'Office',
    'Personal'
  ];

  static const Color emeraldColor = Color(0xFF10B981);
  static const Color emeraldAccentColor = Color(0xFF6EE7B7);

  @override
  void initState() {
    super.initState();
    _fetchItems();
  }

  Future<void> _fetchItems() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.getBuyingItems();
      setState(() {
        _items = res['buying_items'] ?? [];
        _summary = res['summary'] ?? {'total_estimated_budget': 0.0};
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _markPurchased(int id) async {
    try {
      await ApiService.markBuyingItemPurchased(id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('🎉 Marked as Purchased & Auto-logged in Expenses!')),
        );
      }
      _fetchItems();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _deleteItem(int id) async {
    try {
      await ApiService.deleteBuyingItem(id);
      _fetchItems();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  void _showAddBuyingSheet({String? defaultTitle, String? defaultCategory, String? defaultPrice}) {
    final titleCtrl = TextEditingController(text: defaultTitle ?? '');
    final priceCtrl = TextEditingController(text: defaultPrice ?? '');
    final storeCtrl = TextEditingController();
    final notesCtrl = TextEditingController();
    String category = defaultCategory ?? 'General';
    String priority = 'high';
    String status = 'wishlist';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
                top: 20,
                left: 20,
                right: 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '🛍️ Add Buying Item / Life Ambition',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: titleCtrl,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'Item Name / Goal',
                        labelStyle: const TextStyle(color: Colors.white70),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: priceCtrl,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              labelText: 'Est. Price (\$)',
                              labelStyle: const TextStyle(color: Colors.white70),
                              filled: true,
                              fillColor: const Color(0xFF0F172A),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            initialValue: category,
                            dropdownColor: const Color(0xFF0F172A),
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              labelText: 'Category',
                              labelStyle: const TextStyle(color: Colors.white70),
                              filled: true,
                              fillColor: const Color(0xFF0F172A),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                            ),
                            items: [
                              'Vehicle',
                              'Jewelry',
                              'Food & Dining',
                              'Life Ambition',
                              'Tech',
                              'Office',
                              'Personal',
                              'General'
                            ].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                            onChanged: (val) => setSheetState(() => category = val!),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: notesCtrl,
                      maxLines: 2,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'Notes / Target Details',
                        labelStyle: const TextStyle(color: Colors.white70),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.accentAmber,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: () async {
                          if (titleCtrl.text.trim().isEmpty || priceCtrl.text.trim().isEmpty) return;
                          await ApiService.createBuyingItem({
                            'title': titleCtrl.text,
                            'estimated_price': double.tryParse(priceCtrl.text) ?? 0.0,
                            'priority': priority,
                            'status': status,
                            'category': category,
                            'store_url': storeCtrl.text,
                            'notes': notesCtrl.text,
                          });
                          if (ctx.mounted) Navigator.pop(ctx);
                          _fetchItems();
                        },
                        child: const Text('Save Buying Ambition', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _items.where((i) {
      if (_selectedCategory == 'All') return true;
      return (i['category'] ?? 'General').toString().toLowerCase() == _selectedCategory.toLowerCase();
    }).toList();

    final budget = (_summary['total_estimated_budget'] ?? 0.0).toDouble();

    return Scaffold(
      appBar: AppBar(
        title: const Text('🛍️ Buying Ambitions & Wishlist', style: TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: const Color(0xFF0F172A),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: Colors.amberAccent),
            onPressed: () => _showAddBuyingSheet(),
          )
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Colors.amberAccent))
          : Column(
              children: [
                // Quick Preset Shortcuts Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  color: const Color(0xFF0F172A),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('QUICK AMBITION PRESETS:', style: TextStyle(color: Colors.amberAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF1E293B),
                                foregroundColor: Colors.indigoAccent,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: const Text('🚗'),
                              label: const Text('Car / Bike'),
                              onPressed: () => _showAddBuyingSheet(
                                defaultTitle: '🏍️ Dream Sports Bike / Car',
                                defaultCategory: 'Vehicle',
                                defaultPrice: '2500',
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF1E293B),
                                foregroundColor: Colors.amberAccent,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: const Text('💍'),
                              label: const Text('Gold Chain / Ring'),
                              onPressed: () => _showAddBuyingSheet(
                                defaultTitle: '💍 22K Gold Chain & Ring',
                                defaultCategory: 'Jewelry',
                                defaultPrice: '1000',
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF1E293B),
                                foregroundColor: Colors.redAccent,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: const Text('🍔'),
                              label: const Text('Food Outing'),
                              onPressed: () => _showAddBuyingSheet(
                                defaultTitle: '🍔 Fine Dining & Food Outing',
                                defaultCategory: 'Food & Dining',
                                defaultPrice: '120',
                              ),
                            ),
                          ],
                        ),
                      )
                    ],
                  ),
                ),

                // Total Estimated Budget Banner
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF78350F), Color(0xFF0F172A)]),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: Colors.amber.withOpacity(0.4)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('WISHLIST BUDGET', style: TextStyle(color: Colors.amberAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text(
                            '\$${budget.toStringAsFixed(2)}',
                            style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                          ),
                        ],
                      ),
                      const Icon(Icons.shopping_bag_outlined, color: Colors.amberAccent, size: 36),
                    ],
                  ),
                ),

                // Category Pills
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: _categories.map((cat) {
                      final isSel = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(cat),
                          selected: isSel,
                          selectedColor: Colors.amber.shade700,
                          backgroundColor: const Color(0xFF1E293B),
                          labelStyle: TextStyle(
                            color: isSel ? Colors.white : Colors.white70,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                          onSelected: (_) => setState(() => _selectedCategory = cat),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 12),

                // Items List
                Expanded(
                  child: filtered.isEmpty
                      ? const Center(child: Text('No buying items in this category.', style: TextStyle(color: Colors.white38)))
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filtered.length,
                          itemBuilder: (ctx, idx) {
                            final item = filtered[idx];
                            final price = (item['estimated_price'] ?? 0.0).toDouble();
                            final isPurchased = item['status'] == 'purchased';

                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(
                                  color: isPurchased ? emeraldColor.withOpacity(0.5) : Colors.white10,
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          item['title'] ?? '',
                                          style: TextStyle(
                                            color: isPurchased ? Colors.white54 : Colors.white,
                                            decoration: isPurchased ? TextDecoration.lineThrough : null,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        '\$${price.toStringAsFixed(2)}',
                                        style: const TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.w900, fontSize: 16),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: Colors.amber.withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          item['category'] ?? 'General',
                                          style: const TextStyle(color: Colors.amberAccent, fontSize: 10, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: isPurchased ? emeraldColor.withOpacity(0.2) : Colors.purple.withOpacity(0.2),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          item['status'] ?? 'wishlist',
                                          style: TextStyle(
                                            color: isPurchased ? emeraldAccentColor : Colors.purpleAccent,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (item['notes'] != null && item['notes'].toString().isNotEmpty) ...[
                                    const SizedBox(height: 8),
                                    Text(
                                      item['notes'],
                                      style: const TextStyle(color: Colors.white70, fontSize: 12),
                                    ),
                                  ],
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      if (!isPurchased)
                                        ElevatedButton.icon(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: emeraldColor,
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                          ),
                                          icon: const Icon(Icons.check_circle_outline, size: 16),
                                          label: const Text('Mark Bought 🛒', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                          onPressed: () => _markPurchased(item['id']),
                                        ),
                                      const SizedBox(width: 8),
                                      IconButton(
                                        icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 18),
                                        onPressed: () => _deleteItem(item['id']),
                                      )
                                    ],
                                  )
                                ],
                              ),
                            );
                          },
                        ),
                )
              ],
            ),
    );
  }
}
