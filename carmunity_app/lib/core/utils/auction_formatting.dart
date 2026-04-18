import 'package:intl/intl.dart';

String formatAuctionUsdFromCents(int cents) {
  final dollars = cents / 100.0;
  return NumberFormat.currency(symbol: r'$', decimalDigits: cents % 100 == 0 ? 0 : 2).format(dollars);
}

String formatAuctionBidLine(int highBidCents, int bidCount) {
  if (bidCount <= 0) return 'No bids yet';
  return '${formatAuctionUsdFromCents(highBidCents)} · $bidCount bid${bidCount == 1 ? '' : 's'}';
}

String formatAuctionEndUrgency(DateTime endAt, {DateTime? now}) {
  final n = now ?? DateTime.now();
  if (endAt.isBefore(n)) return 'Ended';
  final diff = endAt.difference(n);
  if (diff.inDays >= 1) return 'Ends in ${diff.inDays}d';
  if (diff.inHours >= 1) return 'Ends in ${diff.inHours}h';
  if (diff.inMinutes >= 1) return 'Ends in ${diff.inMinutes}m';
  return 'Ending soon';
}

String formatAuctionDateTime(DateTime dt) {
  return DateFormat.yMMMd().add_jm().format(dt.toLocal());
}

String formatConditionGrade(String? grade) {
  if (grade == null || grade.isEmpty) return '';
  return grade.replaceAll('_', ' ');
}
