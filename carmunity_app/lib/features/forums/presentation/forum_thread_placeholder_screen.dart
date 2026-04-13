import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';

class ForumThreadPlaceholderScreen extends StatelessWidget {
  const ForumThreadPlaceholderScreen({required this.threadId, super.key});

  final String threadId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thread')),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Text(
          'Thread $threadId — reserved for forum APIs. Replies and ordering stay on the server.',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
        ),
      ),
    );
  }
}
