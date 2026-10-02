import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({Key? key}) : super(key: key);

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  List _tasks = [];
  bool _isLoading = true;
  String _selectedCategory = 'all';

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    try {
      final res = await ApiService.getTasks();
      setState(() {
        _tasks = res['tasks'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _showCreateTaskDialog() {
    final titleController = TextEditingController();
    String category = 'personal';
    String priority = 'medium';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(
            top: 24,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          decoration: const BoxDecoration(
            color: Color(0xFF0F172A),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('New Action Task', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white54),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              TextField(
                controller: titleController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'e.g. Complete quarterly office report',
                  labelText: 'Task Title',
                  filled: true,
                  fillColor: const Color(0xFF0B1120),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Category', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white70)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  _buildCategoryChip('personal', '👤 Personal', category, (cat) => setModalState(() => category = cat)),
                  _buildCategoryChip('office', '🏢 Office', category, (cat) => setModalState(() => category = cat)),
                  _buildCategoryChip('purchase', '🛒 Purchase', category, (cat) => setModalState(() => category = cat)),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    if (titleController.text.trim().isNotEmpty) {
                      await ApiService.createTask({
                        'title': titleController.text.trim(),
                        'category': category,
                        'priority': priority,
                      });
                      if (context.mounted) {
                        Navigator.pop(context);
                      }
                      _loadTasks();
                    }
                  },
                  icon: const Icon(Icons.add_rounded, color: Colors.white, size: 20),
                  label: const Text('Add Task', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryIndigo,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String val, String label, String currentVal, Function(String) onSelect) {
    final isSelected = val == currentVal;
    return ChoiceChip(
      label: Text(label, style: TextStyle(color: isSelected ? Colors.white : Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
      selected: isSelected,
      selectedColor: AppTheme.primaryIndigo,
      backgroundColor: Colors.white.withValues(alpha: 0.08),
      onSelected: (_) => onSelect(val),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppTheme.primaryIndigo)));
    }

    final filteredTasks = _tasks.where((t) {
      if (_selectedCategory == 'all') return true;
      return (t['category'] ?? 'personal').toString().toLowerCase() == _selectedCategory;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tasks & Memos Hub', style: TextStyle(fontWeight: FontWeight.w900)),
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: AppTheme.primaryIndigo.withValues(alpha: 0.3), shape: BoxShape.circle),
              child: const Icon(Icons.add_rounded, color: AppTheme.primaryIndigo, size: 20),
            ),
            onPressed: _showCreateTaskDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildFilterPill('all', 'All Tasks'),
                _buildFilterPill('office', '🏢 Office'),
                _buildFilterPill('personal', '👤 Personal'),
                _buildFilterPill('purchase', '🛒 Purchase'),
              ],
            ),
          ),
          const SizedBox(height: 4),

          // Task List
          Expanded(
            child: filteredTasks.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.task_alt_rounded, size: 48, color: Colors.white24),
                        const SizedBox(height: 12),
                        Text(
                          'No ${_selectedCategory == 'all' ? '' : _selectedCategory} tasks found',
                          style: const TextStyle(color: Colors.white54, fontSize: 13),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredTasks.length,
                    itemBuilder: (context, index) {
                      final t = filteredTasks[index];
                      final isCompleted = t['status'] == 'completed';
                      final category = (t['category'] ?? 'personal').toString();

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: AppTheme.glassCardDecoration(
                          borderColor: isCompleted ? AppTheme.accentEmerald.withValues(alpha: 0.3) : AppTheme.primaryIndigo.withValues(alpha: 0.25),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          leading: IconButton(
                            icon: Icon(
                              isCompleted ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                              color: isCompleted ? AppTheme.accentEmerald : Colors.white38,
                              size: 24,
                            ),
                            onPressed: () async {
                              final newStatus = isCompleted ? 'in_progress' : 'completed';
                              await ApiService.updateTaskStatus(t['id'], newStatus);
                              _loadTasks();
                            },
                          ),
                          title: Text(
                            t['title'] ?? '',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              decoration: isCompleted ? TextDecoration.lineThrough : null,
                              color: isCompleted ? Colors.white54 : Colors.white,
                            ),
                          ),
                          subtitle: Padding(
                            padding: const EdgeInsets.only(top: 4.0),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    category.toUpperCase(),
                                    style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white70),
                                  ),
                                ),
                                if (t['assigned_by'] != null) ...[
                                  const SizedBox(width: 8),
                                  Text(
                                    'From ${t['assigned_by']['name']}',
                                    style: const TextStyle(fontSize: 11, color: Colors.indigoAccent),
                                  ),
                                ]
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateTaskDialog,
        backgroundColor: AppTheme.primaryIndigo,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Add Task', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
      ),
    );
  }

  Widget _buildFilterPill(String val, String label) {
    final isSelected = _selectedCategory == val;
    return GestureDetector(
      onTap: () => setState(() => _selectedCategory = val),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryIndigo : Colors.white.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppTheme.primaryIndigo : Colors.white12),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.white70,
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}

