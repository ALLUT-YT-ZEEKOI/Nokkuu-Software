import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class AchievementsScreen extends StatefulWidget {
  const AchievementsScreen({Key? key}) : super(key: key);

  @override
  State<AchievementsScreen> createState() => _AchievementsScreenState();
}

class _AchievementsScreenState extends State<AchievementsScreen> {
  Map<String, dynamic>? _data;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAchievements();
  }

  Future<void> _loadAchievements() async {
    try {
      final res = await ApiService.getAchievements();
      setState(() {
        _data = res;
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

    final achievements = _data?['achievements'] as List? ?? [];
    final unlocked = _data?['total_unlocked'] ?? 0;
    final points = _data?['total_points'] ?? 0;

    return Scaffold(
      appBar: AppBar(title: const Text('Trophy Room 🏆', style: TextStyle(fontWeight: FontWeight.w900))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Hero Stats Box
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF78350F), Color(0xFF451A03)]),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppTheme.accentAmber.withValues(alpha: 0.5)),
                boxShadow: [
                  BoxShadow(color: AppTheme.accentAmber.withValues(alpha: 0.2), blurRadius: 16, offset: const Offset(0, 4)),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      Text('$unlocked / ${achievements.length}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppTheme.accentAmber)),
                      const SizedBox(height: 2),
                      const Text('UNLOCKED TROPHIES', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.amberAccent, letterSpacing: 0.8)),
                    ],
                  ),
                  Container(height: 36, width: 1, color: Colors.white24),
                  Column(
                    children: [
                      Text('$points XP', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                      const SizedBox(height: 2),
                      const Text('TOTAL REWARD POINTS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white70, letterSpacing: 0.8)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            ...achievements.map((ach) {
              final isUnlocked = ach['is_unlocked'] ?? false;
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: AppTheme.glassCardDecoration(
                  borderColor: isUnlocked ? AppTheme.accentAmber.withValues(alpha: 0.4) : Colors.white10,
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isUnlocked ? AppTheme.accentAmber.withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.05),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isUnlocked ? Icons.emoji_events_rounded : Icons.lock_outline_rounded,
                      color: isUnlocked ? AppTheme.accentAmber : Colors.white24,
                      size: 26,
                    ),
                  ),
                  title: Text(
                    ach['name'] ?? '',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: isUnlocked ? Colors.white : Colors.white54),
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4.0),
                    child: Text(ach['description'] ?? '', style: const TextStyle(fontSize: 12, color: Colors.white60)),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.accentPurple.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text('+${ach['points']} XP', style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.accentPurple, fontSize: 11)),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
