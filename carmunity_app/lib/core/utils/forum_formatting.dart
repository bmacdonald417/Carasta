import 'package:intl/intl.dart';

String formatForumDateTime(DateTime utc) {
  final local = utc.toLocal();
  return DateFormat.yMMMd().add_jm().format(local);
}

String formatForumRelative(DateTime utc) {
  final local = utc.toLocal();
  final now = DateTime.now();
  final diff = now.difference(local);
  if (diff.isNegative) return formatForumDateTime(utc);
  if (diff.inMinutes < 1) return 'Just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
  if (diff.inHours < 24) return '${diff.inHours}h ago';
  if (diff.inDays < 7) return '${diff.inDays}d ago';
  return formatForumDateTime(utc);
}
