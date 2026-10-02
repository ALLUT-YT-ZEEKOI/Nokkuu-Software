import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ExpensesScreen extends StatefulWidget {
  const ExpensesScreen({Key? key}) : super(key: key);

  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  List<dynamic> _expenses = [];
  Map<String, dynamic> _summary = {'total': 0.0, 'by_category': {}};
  bool _loading = true;
  String _selectedCategory = 'All';

  final List<String> _categories = ['All', 'Office', 'Personal', 'Purchase', 'Other'];
  static const Color emeraldColor = Color(0xFF10B981);
  static const Color emeraldAccentColor = Color(0xFF6EE7B7);

  @override
  void initState() {
    super.initState();
    _fetchExpenses();
  }

  Future<void> _fetchExpenses() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.getExpenses();
      setState(() {
        _expenses = res['expenses'] ?? [];
        _summary = res['summary'] ?? {'total': 0.0, 'by_category': {}};
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _deleteExpense(int id) async {
    try {
      await ApiService.deleteExpense(id);
      _fetchExpenses();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  void _showAddExpenseSheet() {
    final titleCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final notesCtrl = TextEditingController();
    String category = 'Personal';

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
                      '🧾 Log New Expense',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: titleCtrl,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'Expense Title / Item',
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
                            controller: amountCtrl,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              labelText: 'Amount (\$)',
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
                            items: ['Office', 'Personal', 'Purchase', 'Other']
                                .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                                .toList(),
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
                        labelText: 'Notes (Optional)',
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
                          backgroundColor: emeraldColor,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: () async {
                          if (titleCtrl.text.trim().isEmpty || amountCtrl.text.trim().isEmpty) return;
                          await ApiService.createExpense({
                            'title': titleCtrl.text,
                            'amount': double.tryParse(amountCtrl.text) ?? 0.0,
                            'category': category,
                            'notes': notesCtrl.text,
                          });
                          if (ctx.mounted) Navigator.pop(ctx);
                          _fetchExpenses();
                        },
                        child: const Text('Save Expense', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
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
    final filtered = _expenses.where((e) {
      if (_selectedCategory == 'All') return true;
      return (e['category'] ?? 'Other').toString().toLowerCase() == _selectedCategory.toLowerCase();
    }).toList();

    final total = (_summary['total'] ?? 0.0).toDouble();

    return Scaffold(
      appBar: AppBar(
        title: const Text('🧾 Expenses Tracker', style: TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: const Color(0xFF0F172A),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: emeraldAccentColor),
            onPressed: _showAddExpenseSheet,
          )
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: emeraldAccentColor))
          : Column(
              children: [
                // Total Spend Banner
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF064E3B), Color(0xFF0F172A)]),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: emeraldColor.withOpacity(0.4)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('TOTAL EXPENSES SPENT', style: TextStyle(color: emeraldAccentColor, fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      Text(
                        '\$${total.toStringAsFixed(2)}',
                        style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w900),
                      ),
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
                          selectedColor: emeraldColor,
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

                // Expense List
                Expanded(
                  child: filtered.isEmpty
                      ? const Center(child: Text('No expenses recorded.', style: TextStyle(color: Colors.white38)))
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filtered.length,
                          itemBuilder: (ctx, idx) {
                            final item = filtered[idx];
                            final amount = (item['amount'] ?? 0.0).toDouble();
                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: Colors.white10),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: emeraldColor.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: const Icon(Icons.receipt_long, color: emeraldAccentColor, size: 24),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item['title'] ?? '',
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                                        ),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: Colors.white10,
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Text(
                                                item['category'] ?? 'Other',
                                                style: const TextStyle(color: Colors.white70, fontSize: 10),
                                              ),
                                            ),
                                            if (item['notes'] != null && item['notes'].toString().isNotEmpty) ...[
                                              const SizedBox(width: 8),
                                              Expanded(
                                                child: Text(
                                                  item['notes'],
                                                  overflow: TextOverflow.ellipsis,
                                                  style: const TextStyle(color: Colors.white38, fontSize: 11),
                                                ),
                                              )
                                            ]
                                          ],
                                        )
                                      ],
                                    ),
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        '\$${amount.toStringAsFixed(2)}',
                                        style: const TextStyle(color: emeraldAccentColor, fontWeight: FontWeight.w900, fontSize: 16),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.delete_outline, color: Colors.white38, size: 18),
                                        onPressed: () => _deleteExpense(item['id']),
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
