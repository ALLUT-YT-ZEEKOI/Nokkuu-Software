import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class GoalsScreen extends StatefulWidget {
  const GoalsScreen({Key? key}) : super(key: key);

  @override
  State<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends State<GoalsScreen> {
  List _goals = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadGoals();
  }

  Future<void> _loadGoals() async {
    try {
      final res = await ApiService.getGoals();
      setState(() {
        _goals = res['goals'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppTheme.primaryIndigo)));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Growth Goals 🎯', style: TextStyle(fontWeight: FontWeight.w900))),
      body: _goals.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.track_changes_rounded, size: 48, color: Colors.white24),
                  const SizedBox(height: 12),
                  const Text('No active goals recorded.', style: TextStyle(color: Colors.white54, fontSize: 13)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _goals.length,
              itemBuilder: (context, index) {
                final goal = _goals[index];
                final progress = goal['progress_percentage'] ?? 0;
                final milestones = goal['milestones'] as List? ?? [];

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: AppTheme.glassCardDecoration(
                    borderColor: AppTheme.primaryIndigo.withValues(alpha: 0.35),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(18.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                goal['title'] ?? '',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryIndigo.withValues(alpha: 0.25),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppTheme.primaryIndigo.withValues(alpha: 0.4)),
                              ),
                              child: Text(
                                '$progress%',
                                style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.indigoAccent, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: LinearProgressIndicator(
                            value: progress / 100,
                            backgroundColor: Colors.white12,
                            color: AppTheme.primaryIndigo,
                            minHeight: 8,
                          ),
                        ),
                        const SizedBox(height: 14),
                        const Text('Milestones Breakdown', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white54)),
                        const SizedBox(height: 6),
                        ...milestones.map((m) => Theme(
                              data: ThemeData(unselectedWidgetColor: Colors.white38),
                              child: CheckboxListTile(
                                value: m['is_completed'] ?? false,
                                title: Text(
                                  m['title'] ?? '',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: (m['is_completed'] ?? false) ? Colors.white54 : Colors.white,
                                    decoration: (m['is_completed'] ?? false) ? TextDecoration.lineThrough : null,
                                  ),
                                ),
                                activeColor: AppTheme.accentEmerald,
                                dense: true,
                                contentPadding: EdgeInsets.zero,
                                onChanged: (val) async {
                                  await ApiService.toggleMilestone(goal['id'], m['id']);
                                  _loadGoals();
                                },
                              ),
                            )),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

