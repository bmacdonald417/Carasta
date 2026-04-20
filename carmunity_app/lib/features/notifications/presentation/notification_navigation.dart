import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../app/config/app_config.dart';
import '../../../app/router/routes.dart';
import '../../../shared/dto/notification_summary.dart';

/// Maps notification payloads to the same destinations as web `NotificationDropdown`.
Future<void> openNotificationTarget(BuildContext context, NotificationSummary n) async {
  final p = n.payload;

  String? asString(String key) {
    final v = p[key];
    return v is String && v.trim().isNotEmpty ? v.trim() : null;
  }

  final threadId = asString('threadId');
  final postId = asString('postId');
  final auctionId = asString('auctionId');
  final href = asString('href');
  final marketingHref = asString('marketingHref');

  if (threadId != null) {
    context.push(AppRoutes.forumThread(threadId));
    return;
  }
  if (postId != null) {
    context.push(AppRoutes.postDetail(postId));
    return;
  }
  if (auctionId != null) {
    context.push(AppRoutes.auctionDetail(auctionId));
    return;
  }

  final external = marketingHref ?? href;
  if (external != null) {
    if (external.startsWith('/')) {
      final path = external.split('?').first;
      final segs = path.split('/').where((s) => s.isNotEmpty).toList();
      // /explore/post/:id
      if (segs.length >= 3 && segs[0] == 'explore' && segs[1] == 'post') {
        context.push(AppRoutes.postDetail(segs[2]));
        return;
      }
      // /auctions/:id
      if (segs.length >= 2 && segs[0] == 'auctions') {
        context.push(AppRoutes.auctionDetail(segs[1]));
        return;
      }
      // /discussions/.../.../:threadId (thread id is last segment)
      if (segs.isNotEmpty && segs[0] == 'discussions' && segs.length >= 2) {
        context.push(AppRoutes.forumThread(segs.last));
        return;
      }
      final base = AppConfig.instance.apiBaseUrl;
      final uri = Uri.parse('$base$external');
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
      return;
    }

    final uri = Uri.tryParse(external);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
