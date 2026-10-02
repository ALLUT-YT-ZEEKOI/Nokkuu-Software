import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class AssignedTasksScreen extends StatefulWidget {
  const AssignedTasksScreen({Key? key}) : super(key: key);

  @override
  State<AssignedTasksScreen> createState() => _AssignedTasksScreenState();
}

class _AssignedTasksScreenState extends State<AssignedTasksScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  Map<String, dynamic>? _data;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadAssignedTasks();
  }

  Future<void> _loadAssignedTasks() async {
    try {
      final res = await ApiService.getAssignedTasksHub();
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
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppTheme.primaryIndigo)),
      );
    }

    final receivedTasks = _data?['received_tasks'] as List? ?? [];
    final sentTasks = _data?['sent_tasks'] as List? ?? [];
    final communityTasks = _data?['community_assigned_tasks'] as List? ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Assigned Tasks Hub', style: TextStyle(fontWeight: FontWeight.w900)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primaryIndigo,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 13),
          tabs: [
            Tab(text: 'Received (${receivedTasks.length})'),
            Tab(text: 'Sent (${sentTasks.length})'),
            const Tab(text: 'Community 🌐'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTaskList(receivedTasks, isReceived: true),
          _buildTaskList(sentTasks, isReceived: false),
          _buildCommunityList(communityTasks),
        ],
      ),
    );
  }

  Widget _buildTaskList(List tasks, {required bool isReceived}) {
    if (tasks.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.assignment_turned_in_rounded, size: 48, color: Colors.white24),
            const SizedBox(height: 12),
            Text(
              isReceived ? 'No received assigned tasks' : 'No sent assigned tasks',
              style: const TextStyle(color: Colors.white54, fontSize: 13),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: tasks.length,
      itemBuilder: (context, index) {
        final task = tasks[index];
        final title = task['title'] ?? '';
        final status = (task['status'] ?? 'pending').toString().toLowerCase();
        final counterpart = isReceived
            ? (task['assigned_by'] != null ? task['assigned_by']['name'] : null)
            : (task['user'] != null ? task['user']['name'] : null);

        Color statusColor;
        if (status == 'completed') {
          statusColor = AppTheme.accentEmerald;
        } else if (status == 'accepted' || status == 'in_progress') {
          statusColor = AppTheme.accentCyan;
        } else {
          statusColor = AppTheme.accentAmber;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: AppTheme.glassCardDecoration(borderColor: statusColor.withValues(alpha: 0.35)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(isReceived ? Icons.call_received_rounded : Icons.call_made_rounded, size: 14, color: Colors.white54),
                    const SizedBox(width: 6),
                    Text(
                      isReceived ? 'Assigned by: ${counterpart ?? 'Friend'}' : 'Assigned to: ${counterpart ?? 'Friend'}',
                      style: const TextStyle(fontSize: 12, color: Colors.white70),
                    ),
                  ],
                ),
                if (isReceived && status != 'completed') ...[
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (status == 'pending') ...[
                        ElevatedButton.icon(
                          onPressed: () async {
                            await ApiService.updateTaskStatus(task['id'], 'accepted');
                            _loadAssignedTasks();
                          },
                          icon: const Icon(Icons.check_rounded, size: 16, color: Colors.white),
                          label: const Text('Accept Task', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.accentEmerald,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ] else ...[
                        ElevatedButton.icon(
                          onPressed: () async {
                            await ApiService.updateTaskStatus(task['id'], 'completed');
                            _loadAssignedTasks();
                          },
                          icon: const Icon(Icons.task_alt_rounded, size: 16, color: Colors.white),
                          label: const Text('Mark Completed ✓', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryIndigo,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ]
                    ],
                  )
                ]
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCommunityList(List tasks) {
    if (tasks.isEmpty) {
      return const Center(
        child: Text('No community assigned activity yet.', style: TextStyle(color: Colors.white54, fontSize: 13)),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: tasks.length,
      itemBuilder: (context, index) {
        final task = tasks[index];
        final assigner = task['assigned_by'] != null ? task['assigned_by']['name'] : 'User';
        final assignee = task['user'] != null ? task['user']['name'] : 'Friend';
        final title = task['title'] ?? '';

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: AppTheme.glassCardDecoration(borderColor: AppTheme.accentPink.withValues(alpha: 0.3)),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppTheme.accentPink.withValues(alpha: 0.2), shape: BoxShape.circle),
              child: const Icon(Icons.public_rounded, color: AppTheme.accentPink, size: 20),
            ),
            title: Text('$assigner  ➔  $assignee', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white)),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Text('Task: "$title"', style: const TextStyle(fontSize: 12, color: Colors.white70)),
            ),
          ),
        );
      },
    );
  }
}
