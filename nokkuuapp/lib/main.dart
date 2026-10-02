import 'package:flutter/material.dart';
import 'services/api_service.dart';
import 'theme/app_theme.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/goals_screen.dart';
import 'screens/tasks_screen.dart';
import 'screens/tote_pad_screen.dart';
import 'screens/expenses_screen.dart';
import 'screens/credits_screen.dart';
import 'screens/buying_screen.dart';
import 'screens/assigned_tasks_screen.dart';
import 'screens/habits_screen.dart';
import 'screens/friends_screen.dart';
import 'screens/challenges_screen.dart';
import 'screens/achievements_screen.dart';

void main() {
  runApp(const NokkuuApp());
}

class NokkuuApp extends StatefulWidget {
  const NokkuuApp({Key? key}) : super(key: key);

  @override
  State<NokkuuApp> createState() => _NokkuuAppState();
}

class _NokkuuAppState extends State<NokkuuApp> {
  bool _isLoggedIn = false;
  bool _isCheckingAuth = true;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final token = await ApiService.getToken();
    setState(() {
      _isLoggedIn = token != null;
      _isCheckingAuth = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Nokkuu Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: _isCheckingAuth
          ? const Scaffold(body: Center(child: CircularProgressIndicator(color: AppTheme.primaryIndigo)))
          : _isLoggedIn
              ? MainNavigation(onLogout: () async {
                  await ApiService.removeToken();
                  setState(() => _isLoggedIn = false);
                })
              : LoginScreen(onLoginSuccess: () => setState(() => _isLoggedIn = true)),
    );
  }
}

class MainNavigation extends StatefulWidget {
  final VoidCallback onLogout;
  const MainNavigation({Key? key, required this.onLogout}) : super(key: key);

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    if (index == 4) {
      _showFeatureHubSheet(context);
    } else {
      setState(() => _selectedIndex = index);
    }
  }

  void _showFeatureHubSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '⚡ Nokkuu Growth Hub',
                    style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white54),
                    onPressed: () => Navigator.pop(ctx),
                  )
                ],
              ),
              const SizedBox(height: 16),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 3,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                children: [
                  _hubCard(ctx, 'Goals', Icons.track_changes, Colors.indigoAccent, () => _openScreen(ctx, const GoalsScreen())),
                  _hubCard(ctx, 'Habits', Icons.local_fire_department, Colors.amberAccent, () => _openScreen(ctx, const HabitsScreen())),
                  _hubCard(ctx, 'Friends', Icons.people_outline, Colors.pinkAccent, () => _openScreen(ctx, const FriendsScreen())),
                  _hubCard(ctx, 'Challenges', Icons.emoji_events_outlined, Colors.purpleAccent, () => _openScreen(ctx, const ChallengesScreen())),
                  _hubCard(ctx, 'Badges', Icons.star_outline, Colors.tealAccent, () => _openScreen(ctx, const AchievementsScreen())),
                  _hubCard(ctx, 'Assigned', Icons.send_outlined, Colors.blueAccent, () => _openScreen(ctx, const AssignedTasksScreen())),
                ],
              ),
              const SizedBox(height: 20),
              Divider(color: Colors.white.withOpacity(0.1)),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.redAccent),
                title: const Text('Logout', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                onTap: () {
                  Navigator.pop(ctx);
                  widget.onLogout();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _hubCard(BuildContext ctx, String label, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: () {
        Navigator.pop(ctx);
        onTap();
      },
      borderRadius: BorderRadius.circular(18),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  void _openScreen(BuildContext context, Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      DashboardScreen(onNavigateTab: _onItemTapped),
      const TasksAndNotesTab(),
      const FinanceHubTab(),
      const BuyingScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: pages,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Colors.white10, width: 0.5)),
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
          type: BottomNavigationBarType.fixed,
          backgroundColor: const Color(0xFF0F172A),
          selectedItemColor: AppTheme.primaryIndigo,
          unselectedItemColor: Colors.white38,
          selectedFontSize: 11,
          unselectedFontSize: 10,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.grid_view_rounded), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.task_alt_rounded), label: 'Tasks & Memos'),
            BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet_rounded), label: 'Finance'),
            BottomNavigationBarItem(icon: Icon(Icons.shopping_bag_rounded), label: 'Ambitions'),
            BottomNavigationBarItem(icon: Icon(Icons.apps_rounded), label: 'More Hub'),
          ],
        ),
      ),
    );
  }
}

class TasksAndNotesTab extends StatelessWidget {
  const TasksAndNotesTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: const Color(0xFF0F172A),
          elevation: 0,
          title: const Text('Tasks & Memos', style: TextStyle(fontWeight: FontWeight.w900)),
          bottom: const TabBar(
            indicatorColor: Colors.purpleAccent,
            labelColor: Colors.purpleAccent,
            unselectedLabelColor: Colors.white54,
            labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            tabs: [
              Tab(text: '📋 Tasks & To-dos'),
              Tab(text: '📝 Tote Pad Notes'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            TasksScreen(),
            TotePadScreen(),
          ],
        ),
      ),
    );
  }
}

class FinanceHubTab extends StatelessWidget {
  const FinanceHubTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: const Color(0xFF0F172A),
          elevation: 0,
          title: const Text('Finance & Money Hub', style: TextStyle(fontWeight: FontWeight.w900)),
          bottom: const TabBar(
            indicatorColor: Color(0xFF6EE7B7),
            labelColor: Color(0xFF6EE7B7),
            unselectedLabelColor: Colors.white54,
            labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            tabs: [
              Tab(text: '🧾 Expenses'),
              Tab(text: '💵 Cash Received'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            ExpensesScreen(),
            CreditsScreen(),
          ],
        ),
      ),
    );
  }
}
