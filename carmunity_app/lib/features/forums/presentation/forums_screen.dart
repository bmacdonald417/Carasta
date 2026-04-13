import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/utils/responsive_layout.dart';

class ForumsScreen extends StatelessWidget {
  const ForumsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Forums'),
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(h, AppSpacing.lg, h, AppSpacing.xxl),
        children: [
          Text(
            'Community spaces',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Forum threads will sync with the Carasta backend once models and APIs exist.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: AppSpacing.xl),
          _ForumEntryCard(
            title: 'Mechanics Corner',
            subtitle: 'Diagnostics, wrenching, and technical deep dives.',
            icon: Icons.build_circle_outlined,
            onTap: () => context.push('/forums/c/mechanics'),
          ),
          const SizedBox(height: AppSpacing.md),
          _ForumEntryCard(
            title: 'Gear Interests',
            subtitle: 'Wheels, audio, detailing, and everything in between.',
            icon: Icons.sports_motorsports_outlined,
            onTap: () => context.push('/forums/c/gear'),
          ),
        ],
      ),
    );
  }
}

class _ForumEntryCard extends StatelessWidget {
  const _ForumEntryCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceCard,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: DecoratedBox(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceElevated,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  ),
                  child: Icon(icon, color: AppColors.accent, size: 28),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: Theme.of(context).textTheme.titleSmall),
                      const SizedBox(height: AppSpacing.xxs),
                      Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
