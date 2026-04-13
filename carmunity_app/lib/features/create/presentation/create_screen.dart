import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/utils/responsive_layout.dart';

class CreateScreen extends StatelessWidget {
  const CreateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create'),
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(h, AppSpacing.lg, h, AppSpacing.xxl),
        children: [
          Text(
            'Share with Carmunity',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Creation flows call Carasta APIs in later phases — no duplicate business logic here.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: AppSpacing.xl),
          const _CreateTile(
            icon: Icons.edit_note_rounded,
            title: 'Post',
            subtitle: 'Text and photos to the main feed.',
          ),
          const _CreateTile(
            icon: Icons.forum_outlined,
            title: 'Forum thread',
            subtitle: 'Start a discussion in Mechanics Corner or Gear Interests.',
          ),
          const _CreateTile(
            icon: Icons.photo_library_outlined,
            title: 'Media upload',
            subtitle: 'Photos first; other media types follow platform rollout.',
          ),
          const _CreateTile(
            icon: Icons.link_rounded,
            title: 'Share link',
            subtitle: 'Link previews in a later slice.',
          ),
        ],
      ),
    );
  }
}

class _CreateTile extends StatelessWidget {
  const _CreateTile({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Material(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: ListTile(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            side: const BorderSide(color: AppColors.borderSubtle),
          ),
          leading: Icon(icon, color: AppColors.accent),
          title: Text(title, style: Theme.of(context).textTheme.titleSmall),
          subtitle: Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('$title — coming in a later phase')),
            );
          },
        ),
      ),
    );
  }
}
