import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/utils/responsive_layout.dart';

/// Primary chrome: bottom nav on phones; navigation rail + spacious content on Windows/wide.
class AppShell extends StatelessWidget {
  const AppShell({required this.navigationShell, super.key});

  final StatefulNavigationShell navigationShell;

  static const _destinations = <_NavDest>[
    _NavDest(label: 'Home', icon: Icons.home_outlined, selectedIcon: Icons.home_rounded),
    _NavDest(label: 'Forums', icon: Icons.forum_outlined, selectedIcon: Icons.forum_rounded),
    _NavDest(label: 'Create', icon: Icons.add_circle_outline, selectedIcon: Icons.add_circle),
    _NavDest(label: 'Auctions', icon: Icons.gavel_outlined, selectedIcon: Icons.gavel_rounded),
    _NavDest(label: 'You', icon: Icons.person_outline_rounded, selectedIcon: Icons.person_rounded),
  ];

  void _onSelect(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final index = navigationShell.currentIndex;
    final rail = useRailLayout(context);

    if (rail) {
      return Scaffold(
        body: Row(
          children: [
            NavigationRail(
              selectedIndex: index,
              onDestinationSelected: _onSelect,
              labelType: NavigationRailLabelType.all,
              backgroundColor: Theme.of(context).colorScheme.surface,
              destinations: [
                for (final d in _destinations)
                  NavigationRailDestination(
                    icon: Icon(d.icon),
                    selectedIcon: Icon(d.selectedIcon),
                    label: Text(d.label),
                  ),
              ],
            ),
            const VerticalDivider(width: 1, thickness: 1),
            Expanded(
              child: ColoredBox(
                color: Theme.of(context).scaffoldBackgroundColor,
                child: constrainedContent(
                  context: context,
                  child: navigationShell,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      body: constrainedContent(
        context: context,
        child: navigationShell,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: _onSelect,
        destinations: [
          for (final d in _destinations)
            NavigationDestination(
              icon: Icon(d.icon),
              selectedIcon: Icon(d.selectedIcon),
              label: d.label,
            ),
        ],
      ),
    );
  }
}

class _NavDest {
  const _NavDest({
    required this.label,
    required this.icon,
    required this.selectedIcon,
  });

  final String label;
  final IconData icon;
  final IconData selectedIcon;
}
