import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class ChallengesScreen extends StatefulWidget {
  const ChallengesScreen({Key? key}) : super(key: key);

  @override
  State<ChallengesScreen> createState() => _ChallengesScreenState();
}

class _ChallengesScreenState extends State<ChallengesScreen> {
  List _challenges = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadChallenges();
  }

  Future<void> _loadChallenges() async {
    try {
      final res = await ApiService.getChallenges();
      setState(() {
        _challenges = res['challenges'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppTheme.accentPurple)));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Accountability Challenges 🏆', style: TextStyle(fontWeight: FontWeight.w900))),
      body: _challenges.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.emoji_events_rounded, size: 48, color: Colors.white24),
                  const SizedBox(height: 12),
                  const Text('No community challenges active right now.', style: TextStyle(color: Colors.white54, fontSize: 13)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _challenges.length,
              itemBuilder: (context, index) {
                final c = _challenges[index];
                final isJoined = c['is_joined'] ?? false;

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: AppTheme.glassCardDecoration(borderColor: AppTheme.accentPurple.withValues(alpha: 0.35)),
                  child: Padding(
                    padding: const EdgeInsets.all(18.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(c['title'] ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: AppTheme.accentPurple.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(10)),
                              child: Text(c['category'] ?? 'Coding', style: const TextStyle(fontSize: 11, color: AppTheme.accentPurple, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(c['description'] ?? '', style: const TextStyle(fontSize: 13, color: Colors.white70)),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.group_rounded, size: 16, color: Colors.indigoAccent),
                                const SizedBox(width: 6),
                                Text('${(c['participants'] as List? ?? []).length} Members', style: const TextStyle(fontSize: 12, color: Colors.indigoAccent, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            ElevatedButton(
                              onPressed: () async {
                                if (!isJoined) {
                                  await ApiService.joinChallenge(c['id']);
                                  _loadChallenges();
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isJoined ? Colors.white.withValues(alpha: 0.1) : AppTheme.accentPurple,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              child: Text(isJoined ? 'Joined ✓' : 'Join Challenge 🚀', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isJoined ? Colors.white70 : Colors.white)),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

