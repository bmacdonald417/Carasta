import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/services/push_notification_service.dart';

/// Carmunity alerts — same conceptual inbox as the Carasta web header bell.
/// [PushNotificationService] is the hook for device push later.
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: ListView(
        padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.xxl),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.notifications_active_outlined, color: AppColors.accent),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      PushNotificationService.phase1Banner,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Live queue (parity)',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Carasta keeps one notification model per account. On the web, open the bell in the header — '
            'this screen will list the same Carmunity + listing items from the Carasta APIs as the mobile '
            'inbox is wired to your session (no separate “app-only” inbox).',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
