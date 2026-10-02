import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class FriendsScreen extends StatefulWidget {
  const FriendsScreen({Key? key}) : super(key: key);

  @override
  State<FriendsScreen> createState() => _FriendsScreenState();
}

class _FriendsScreenState extends State<FriendsScreen> {
  List _friends = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFriends();
  }

  Future<void> _loadFriends() async {
    try {
      final res = await ApiService.getFriends();
      setState(() {
        _friends = res['friends'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _showAssignTaskDialog(Map friend) {
    final titleController = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          top: 24,
          left: 20,
          right: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        ),
        decoration: const BoxDecoration(
          color: Color(0xFF1E1B4B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Assign Task to ${friend['name']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
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
                labelText: 'Task Title',
                hintText: 'e.g. Complete React Dashboard',
                filled: true,
                fillColor: Colors.white.withValues(alpha: 0.05),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  if (titleController.text.trim().isNotEmpty) {
                    await ApiService.createTask({
                      'title': titleController.text.trim(),
                      'assigned_to_user_id': friend['id'],
                      'priority': 'high',
                    });
                    if (context.mounted) {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Task assigned to ${friend['name']}!'),
                          backgroundColor: AppTheme.accentEmerald,
                        ),
                      );
                    }
                  }
                },
                icon: const Icon(Icons.send_rounded, color: Colors.white),
                label: const Text('Send Assigned Task', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
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
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppTheme.accentPurple)));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Growth Buddies 🤝', style: TextStyle(fontWeight: FontWeight.w900))),
      body: _friends.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.people_alt_rounded, size: 48, color: Colors.white24),
                  const SizedBox(height: 12),
                  const Text('No growth buddies connected yet.', style: TextStyle(color: Colors.white54, fontSize: 13)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _friends.length,
              itemBuilder: (context, index) {
                final friend = _friends[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: AppTheme.glassCardDecoration(borderColor: AppTheme.primaryIndigo.withValues(alpha: 0.3)),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: CircleAvatar(
                      radius: 22,
                      backgroundImage: NetworkImage(friend['avatar'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
                    ),
                    title: Text(friend['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white)),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4.0),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: AppTheme.accentPurple.withValues(alpha: 0.25), borderRadius: BorderRadius.circular(6)),
                            child: Text('Lvl ${friend['level'] ?? 1}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.accentPurple)),
                          ),
                          const SizedBox(width: 8),
                          Text('${friend['streak_count'] ?? 0}d Streak 🔥', style: const TextStyle(fontSize: 11, color: Colors.white70)),
                        ],
                      ),
                    ),
                    trailing: ElevatedButton.icon(
                      onPressed: () => _showAssignTaskDialog(friend),
                      icon: const Icon(Icons.send_rounded, size: 14, color: Colors.white),
                      label: const Text('Assign', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryIndigo,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}

