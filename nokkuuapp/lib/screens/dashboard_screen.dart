import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'tote_pad_screen.dart';
import 'expenses_screen.dart';
import 'credits_screen.dart';
import 'buying_screen.dart';

class DashboardScreen extends StatefulWidget {
  final Function(int) onNavigateTab;
  const DashboardScreen({Key? key, required this.onNavigateTab}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _dashboardData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    try {
      final data = await ApiService.getDashboard();
      setState(() {
        _dashboardData = data;
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
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: AppTheme.primaryIndigo),
              SizedBox(height: 12),
              Text('Syncing Nokkuu Cloud...', style: TextStyle(color: Colors.white54, fontSize: 12)),
            ],
          ),
        ),
      );
    }

    final todayTasks = _dashboardData?['today_tasks'] as List? ?? [];
    final goalsSummary = _dashboardData?['goals_summary'] ?? {};
    final tasksSummary = _dashboardData?['tasks_summary'] ?? {};

    final totalToday = tasksSummary['total_today'] ?? todayTasks.length;
    final completedToday = tasksSummary['completed_today'] ?? todayTasks.where((t) => t['status'] == 'completed').length;
    final pendingToday = tasksSummary['pending_today'] ?? (totalToday - completedToday);
    final todayCompletionRate = tasksSummary['today_completion_rate'] ?? (totalToday > 0 ? ((completedToday / totalToday) * 100).round() : 0);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppTheme.primaryIndigo, AppTheme.accentPurple]),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.remove_red_eye_rounded, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            const Text(
              'NOKKUU',
              style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5, fontSize: 18),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppTheme.primaryIndigo.withValues(alpha: 0.25),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.primaryIndigo.withValues(alpha: 0.4)),
              ),
              child: const Text('നോക്കൂ', style: TextStyle(fontSize: 11, color: Colors.indigoAccent, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadDashboard,
        color: AppTheme.primaryIndigo,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Quick Feature Launchpad
              const Text('Quick Access Launchpad', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 10),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildShortcutChip(
                      context: context,
                      label: 'Tote Pad Notes',
                      icon: Icons.sticky_note_2_rounded,
                      color: AppTheme.accentAmber,
                      targetScreen: const TotePadScreen(),
                    ),
                    const SizedBox(width: 10),
                    _buildShortcutChip(
                      context: context,
                      label: 'Expenses Ledger',
                      icon: Icons.account_balance_wallet_rounded,
                      color: AppTheme.accentEmerald,
                      targetScreen: const ExpensesScreen(),
                    ),
                    const SizedBox(width: 10),
                    _buildShortcutChip(
                      context: context,
                      label: 'Cash Credits',
                      icon: Icons.payments_rounded,
                      color: AppTheme.accentCyan,
                      targetScreen: const CreditsScreen(),
                    ),
                    const SizedBox(width: 10),
                    _buildShortcutChip(
                      context: context,
                      label: 'Buying Ambitions',
                      icon: Icons.stars_rounded,
                      color: AppTheme.accentPurple,
                      targetScreen: const BuyingScreen(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              // Metrics Grid (Today Task Goal & Overall Goal Progress)
              Row(
                children: [
                  Expanded(
                    child: _buildMetricCard(
                      'Today Task Goal',
                      '$todayCompletionRate%',
                      Icons.task_alt_rounded,
                      AppTheme.accentEmerald,
                      subtext: '$completedToday/$totalToday Done ($pendingToday Pending)',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricCard(
                      'Goal Completion',
                      '${goalsSummary['overall_progress'] ?? 0}%',
                      Icons.track_changes_rounded,
                      AppTheme.primaryIndigo,
                      subtext: '${goalsSummary['completed'] ?? 0}/${goalsSummary['total'] ?? 0} Goals Completed',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 22),

              // Today Action Plan Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.today_rounded, color: AppTheme.primaryIndigo, size: 18),
                      SizedBox(width: 8),
                      Text('Today Action Plan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  TextButton(
                    onPressed: () => widget.onNavigateTab(1),
                    child: const Row(
                      children: [
                        Text('View All', style: TextStyle(fontSize: 13, color: Colors.indigoAccent, fontWeight: FontWeight.bold)),
                        Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Colors.indigoAccent),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (todayTasks.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: AppTheme.glassCardDecoration(),
                  child: const Column(
                    children: [
                      Icon(Icons.check_circle_outline_rounded, color: AppTheme.accentEmerald, size: 36),
                      SizedBox(height: 8),
                      Text('All caught up for today!', textAlign: TextAlign.center, style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      SizedBox(height: 4),
                      Text('Tap Tasks & Memos tab to add new action items.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white54, fontSize: 12)),
                    ],
                  ),
                )
              else
                ...todayTasks.map((t) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      decoration: AppTheme.glassCardDecoration(),
                      child: ListTile(
                        leading: IconButton(
                          icon: Icon(
                            t['status'] == 'completed' ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                            color: t['status'] == 'completed' ? AppTheme.accentEmerald : Colors.white38,
                            size: 22,
                          ),
                          onPressed: () async {
                            final newStatus = t['status'] == 'completed' ? 'in_progress' : 'completed';
                            await ApiService.updateTaskStatus(t['id'], newStatus);
                            _loadDashboard();
                          },
                        ),
                        title: Text(
                          t['title'] ?? '',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            decoration: t['status'] == 'completed' ? TextDecoration.lineThrough : null,
                            color: t['status'] == 'completed' ? Colors.white54 : Colors.white,
                          ),
                        ),
                        subtitle: t['assigned_by'] != null
                            ? Text('Assigned by ${t['assigned_by']['name']}', style: const TextStyle(fontSize: 11, color: Colors.indigoAccent))
                            : null,
                      ),
                    )),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShortcutChip({
    required BuildContext context,
    required String label,
    required IconData icon,
    required Color color,
    required Widget targetScreen,
  }) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => targetScreen)),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon, Color color, {String? subtext}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.glassCardDecoration(borderColor: color.withValues(alpha: 0.35)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 10),
          Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
          const SizedBox(height: 2),
          Text(title, style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
          if (subtext != null) ...[
            const SizedBox(height: 2),
            Text(subtext, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600)),
          ],
        ],
      ),
    );
  }
}
