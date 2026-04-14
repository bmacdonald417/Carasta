import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/utils/responsive_layout.dart';

/// Create tab — product hub for Carmunity publishing (Phase 3).
class CreateHubScreen extends StatelessWidget {
  const CreateHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Create')),
      body: ListView(
        padding: EdgeInsets.fromLTRB(h, AppSpacing.lg, h, AppSpacing.xxl),
        children: [
          Text(
            'Publish to Carmunity',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Start a post, share a link, or explore staged creation paths. Server rules stay on Carasta.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xl),
          _HubTile(
            icon: Icons.edit_note_rounded,
            title: 'Post',
            subtitle: 'Text and optional image URL — live with your session.',
            badge: const _LiveBadge(),
            onTap: () => context.push(AppRoutes.createPost),
          ),
          _HubTile(
            icon: Icons.link_rounded,
            title: 'Share link',
            subtitle: 'Post an external URL; preview cards need backend support.',
            badge: const _LiveBadge(),
            onTap: () => context.push(AppRoutes.createShareLink),
          ),
          _HubTile(
            icon: Icons.forum_outlined,
            title: 'Forum thread',
            subtitle: 'Forums API not exposed for mobile yet — staged.',
            badge: const _StagedBadge(),
            onTap: () => context.push(AppRoutes.createForumThread),
          ),
          _HubTile(
            icon: Icons.photo_library_outlined,
            title: 'Media upload',
            subtitle: 'Binary upload pipeline is staged until presign/upload ships.',
            badge: const _StagedBadge(),
            onTap: () => context.push(AppRoutes.createMedia),
          ),
        ],
      ),
    );
  }
}

class _LiveBadge extends StatelessWidget {
  const _LiveBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xxs),
      decoration: BoxDecoration(
        color: AppColors.accent.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        border: Border.all(color: AppColors.accent.withValues(alpha: 0.4)),
      ),
      child: Text(
        'Live',
        style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.accent),
      ),
    );
  }
}

class _StagedBadge extends StatelessWidget {
  const _StagedBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xxs),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Text(
        'Staged',
        style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textTertiary),
      ),
    );
  }
}

class _HubTile extends StatelessWidget {
  const _HubTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.badge,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Widget badge;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Material(
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
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(icon, color: AppColors.accent, size: 28),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(title, style: Theme.of(context).textTheme.titleSmall),
                            ),
                            badge,
                          ],
                        ),
                        const SizedBox(height: AppSpacing.xxs),
                        Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
