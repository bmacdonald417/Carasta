/// Normalizes user-typed URLs for Carmunity posts (client-side only; server still stores plain text).
String? normalizeHttpUrl(String raw) {
  final t = raw.trim();
  if (t.isEmpty) return null;
  var u = Uri.tryParse(t);
  if (u != null && u.hasScheme && (u.host.isNotEmpty)) {
    if (u.scheme == 'http' || u.scheme == 'https') return u.toString();
  }
  u = Uri.tryParse('https://$t');
  if (u != null && u.hasScheme && u.host.isNotEmpty) {
    return u.toString();
  }
  return null;
}
