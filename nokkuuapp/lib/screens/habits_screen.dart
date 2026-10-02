import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class HabitsScreen extends StatefulWidget {
  const HabitsScreen({Key? key}) : super(key: key);

  @override
  State<HabitsScreen> createState() => _HabitsScreenState();
}

class _HabitsScreenState extends State<HabitsScreen> {
  List _habits = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHabits();
  }

  Future<void> _loadHabits() async {
    try {
      final res = await ApiService.getHabits();
      setState(() {
        _habits = res['habits'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppTheme.accentAmber)));
    }

    final todayStr = DateTime.now().toIso8601String().split('T')[0];

    return Scaffold(
      appBar: AppBar(title: const Text('Habit Streaks 🔥', style: TextStyle(fontWeight: FontWeight.w900))),
      body: _habits.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.local_fire_department_rounded, size: 48, color: Colors.white24),
                  const SizedBox(height: 12),
                  const Text('No active habits recorded.', style: TextStyle(color: Colors.white54, fontSize: 13)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _habits.length,
              itemBuilder: (context, index) {
                final habit = _habits[index];
                final logs = (habit['logs'] as List? ?? []).map((l) => l['completed_date']).toList();
                final isLoggedToday = logs.contains(todayStr);

                return Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  decoration: AppTheme.glassCardDecoration(
                    borderColor: isLoggedToday ? AppTheme.accentAmber.withValues(alpha: 0.5) : AppTheme.accentAmber.withValues(alpha: 0.25),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.accentAmber.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.local_fire_department_rounded, color: AppTheme.accentAmber, size: 24),
                    ),
                    title: Text(habit['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white)),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4.0),
                      child: Text(
                        'Streak: ${habit['current_streak']} Days 🔥  |  Best: ${habit['best_streak']} Days',
                        style: const TextStyle(fontSize: 11, color: Colors.white70),
                      ),
                    ),
                    trailing: ElevatedButton(
                      onPressed: () async {
                        await ApiService.toggleHabit(habit['id'], date: todayStr);
                        _loadHabits();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isLoggedToday ? AppTheme.accentAmber.withValues(alpha: 0.25) : AppTheme.accentAmber,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: Text(
                        isLoggedToday ? 'Done 🔥' : 'Check In',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isLoggedToday ? AppTheme.accentAmber : Colors.black87),
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}

