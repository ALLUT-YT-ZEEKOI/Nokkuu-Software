import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class TotePadScreen extends StatefulWidget {
  const TotePadScreen({Key? key}) : super(key: key);

  @override
  State<TotePadScreen> createState() => _TotePadScreenState();
}

class _TotePadScreenState extends State<TotePadScreen> {
  List<dynamic> _notes = [];
  bool _loading = true;
  String _searchQuery = '';
  String _selectedCategory = 'All';

  final List<String> _categories = ['All', 'Office', 'Personal', 'Purchase', 'General'];

  @override
  void initState() {
    super.initState();
    _fetchNotes();
  }

  Future<void> _fetchNotes() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.getNotes();
      setState(() {
        _notes = res['notes'] ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _togglePin(int id) async {
    try {
      await ApiService.toggleNotePin(id);
      _fetchNotes();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _deleteNote(int id) async {
    try {
      await ApiService.deleteNote(id);
      _fetchNotes();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  void _showAddNoteSheet({Map<String, dynamic>? noteToEdit}) {
    final titleCtrl = TextEditingController(text: noteToEdit?['title'] ?? '');
    final contentCtrl = TextEditingController(text: noteToEdit?['content'] ?? '');
    String category = noteToEdit?['category'] ?? 'General';
    String color = noteToEdit?['color'] ?? '#6366f1';
    bool isPinned = noteToEdit?['is_pinned'] ?? false;

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
                    Text(
                      noteToEdit == null ? '📝 New Tote Note' : '✏️ Edit Tote Note',
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: titleCtrl,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'Note Title',
                        labelStyle: const TextStyle(color: Colors.white70),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: contentCtrl,
                      maxLines: 4,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'Note Content / Scratchpad',
                        labelStyle: const TextStyle(color: Colors.white70),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
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
                      items: ['Office', 'Personal', 'Purchase', 'General']
                          .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                          .toList(),
                      onChanged: (val) => setSheetState(() => category = val!),
                    ),
                    const SizedBox(height: 12),
                    CheckboxListTile(
                      value: isPinned,
                      activeColor: Colors.purpleAccent,
                      title: const Text('Pin Note to Top 📌', style: TextStyle(color: Colors.white, fontSize: 14)),
                      onChanged: (val) => setSheetState(() => isPinned = val ?? false),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.accentPurple,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: () async {
                          if (titleCtrl.text.trim().isEmpty) return;
                          final data = {
                            'title': titleCtrl.text,
                            'content': contentCtrl.text,
                            'category': category,
                            'color': color,
                            'is_pinned': isPinned,
                          };

                          if (noteToEdit != null) {
                            await ApiService.updateNote(noteToEdit['id'], data);
                          } else {
                            await ApiService.createNote(data);
                          }
                          if (ctx.mounted) Navigator.pop(ctx);
                          _fetchNotes();
                        },
                        child: Text(
                          noteToEdit == null ? 'Save Note' : 'Update Note',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
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
    final filtered = _notes.where((n) {
      final title = (n['title'] ?? '').toString().toLowerCase();
      final content = (n['content'] ?? '').toString().toLowerCase();
      final cat = (n['category'] ?? 'General').toString().toLowerCase();
      final matchesSearch = title.contains(_searchQuery.toLowerCase()) || content.contains(_searchQuery.toLowerCase());
      final matchesCat = _selectedCategory == 'All' || cat == _selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('📝 Tote Pad & Memos', style: TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: const Color(0xFF0F172A),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: Colors.purpleAccent),
            onPressed: () => _showAddNoteSheet(),
          )
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Colors.purpleAccent))
          : Column(
              children: [
                // Search & Filter Category Pills
                Container(
                  padding: const EdgeInsets.all(16),
                  color: const Color(0xFF0F172A),
                  child: Column(
                    children: [
                      TextField(
                        onChanged: (val) => setState(() => _searchQuery = val),
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'Search Tote Pad...',
                          hintStyle: const TextStyle(color: Colors.white38),
                          prefixIcon: const Icon(Icons.search, color: Colors.white38, size: 20),
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          contentPadding: const EdgeInsets.symmetric(vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: _categories.map((cat) {
                            final isSel = _selectedCategory == cat;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ChoiceChip(
                                label: Text(cat),
                                selected: isSel,
                                selectedColor: Colors.purpleAccent,
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
                      )
                    ],
                  ),
                ),

                // Note Cards List
                Expanded(
                  child: filtered.isEmpty
                      ? const Center(
                          child: Text(
                            'No Tote Pad notes found.\nTap + to add a memo!',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.white38),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filtered.length,
                          itemBuilder: (ctx, idx) {
                            final note = filtered[idx];
                            final isPinned = note['is_pinned'] ?? false;
                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(
                                  color: isPinned ? Colors.amber.withOpacity(0.5) : Colors.white10,
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
                                          note['title'] ?? '',
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                                        ),
                                      ),
                                      IconButton(
                                        icon: Icon(
                                          isPinned ? Icons.push_pin : Icons.push_pin_outlined,
                                          color: isPinned ? Colors.amber : Colors.white38,
                                          size: 20,
                                        ),
                                        onPressed: () => _togglePin(note['id']),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: Colors.purple.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      note['category'] ?? 'General',
                                      style: const TextStyle(color: Colors.purpleAccent, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  if (note['content'] != null && note['content'].toString().isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    Text(
                                      note['content'],
                                      style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                                    ),
                                  ],
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.copy, color: Colors.white38, size: 18),
                                        onPressed: () {
                                          Clipboard.setData(ClipboardData(text: "${note['title']}\n${note['content'] ?? ''}"));
                                          if (context.mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(content: Text('Copied note text to clipboard!')),
                                            );
                                          }
                                        },
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.edit_outlined, color: Colors.white38, size: 18),
                                        onPressed: () => _showAddNoteSheet(noteToEdit: note),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 18),
                                        onPressed: () => _deleteNote(note['id']),
                                      ),
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
