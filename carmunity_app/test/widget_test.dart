import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:carmunity_app/app/app.dart';
import 'package:carmunity_app/app/config/app_config.dart';

void main() {
  testWidgets('CarmunityApp builds home shell', (WidgetTester tester) async {
    TestWidgetsFlutterBinding.ensureInitialized();
    AppConfig.init();

    await tester.pumpWidget(
      const ProviderScope(
        child: CarmunityApp(),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Carmunity'), findsOneWidget);
  });
}
