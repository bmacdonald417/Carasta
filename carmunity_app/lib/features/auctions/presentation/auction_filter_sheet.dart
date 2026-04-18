import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../dto/auction_filter_state.dart';

/// Bottom sheet to edit [AuctionFilterState]. Returns new state on Apply.
class AuctionFilterSheet extends StatefulWidget {
  const AuctionFilterSheet({super.key, required this.initial});

  final AuctionFilterState initial;

  static Future<AuctionFilterState?> show(BuildContext context, AuctionFilterState initial) {
    return showModalBottomSheet<AuctionFilterState>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: AppColors.surface,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(ctx).bottom),
        child: AuctionFilterSheet(initial: initial),
      ),
    );
  }

  @override
  State<AuctionFilterSheet> createState() => _AuctionFilterSheetState();
}

class _AuctionFilterSheetState extends State<AuctionFilterSheet> {
  late final TextEditingController _q;
  late final TextEditingController _yearMin;
  late final TextEditingController _yearMax;
  late final TextEditingController _priceMin;
  late final TextEditingController _priceMax;
  late final TextEditingController _mileageMin;
  late final TextEditingController _mileageMax;
  late final TextEditingController _location;
  late final TextEditingController _zip;
  late final TextEditingController _radius;
  late AuctionSearchSort _sort;
  String? _condition;
  late bool _featuredOnly;
  late bool _noReserve;
  late bool _endingSoon;
  late String _status;

  static const _conditions = <String?>[
    null,
    'CONCOURS',
    'EXCELLENT',
    'VERY_GOOD',
    'GOOD',
    'FAIR',
  ];

  @override
  void initState() {
    super.initState();
    final i = widget.initial;
    _q = TextEditingController(text: i.query);
    _yearMin = TextEditingController(text: i.yearMin?.toString() ?? '');
    _yearMax = TextEditingController(text: i.yearMax?.toString() ?? '');
    _priceMin = TextEditingController(text: i.priceMinDollars?.toString() ?? '');
    _priceMax = TextEditingController(text: i.priceMaxDollars?.toString() ?? '');
    _mileageMin = TextEditingController(text: i.mileageMin?.toString() ?? '');
    _mileageMax = TextEditingController(text: i.mileageMax?.toString() ?? '');
    _location = TextEditingController(text: i.location);
    _zip = TextEditingController(text: i.zip);
    _radius = TextEditingController(text: i.radiusMiles?.toString() ?? '');
    _sort = i.sort;
    _condition = i.conditionGrade;
    _featuredOnly = i.featuredOnly;
    _noReserve = i.noReserve;
    _endingSoon = i.endingSoon;
    _status = i.status;
  }

  @override
  void dispose() {
    _q.dispose();
    _yearMin.dispose();
    _yearMax.dispose();
    _priceMin.dispose();
    _priceMax.dispose();
    _mileageMin.dispose();
    _mileageMax.dispose();
    _location.dispose();
    _zip.dispose();
    _radius.dispose();
    super.dispose();
  }

  int? _parseInt(String s) {
    final t = s.trim();
    if (t.isEmpty) return null;
    return int.tryParse(t);
  }

  double? _parseDouble(String s) {
    final t = s.trim();
    if (t.isEmpty) return null;
    return double.tryParse(t);
  }

  void _apply() {
    final next = AuctionFilterState(
      query: _q.text,
      sort: _sort,
      yearMin: _parseInt(_yearMin.text),
      yearMax: _parseInt(_yearMax.text),
      priceMinDollars: _parseDouble(_priceMin.text),
      priceMaxDollars: _parseDouble(_priceMax.text),
      mileageMin: _parseInt(_mileageMin.text),
      mileageMax: _parseInt(_mileageMax.text),
      location: _location.text,
      conditionGrade: _condition,
      featuredOnly: _featuredOnly,
      noReserve: _noReserve,
      endingSoon: _endingSoon,
      status: _status,
      zip: _zip.text,
      radiusMiles: _parseInt(_radius.text),
      pageSize: widget.initial.pageSize,
    );
    Navigator.of(context).pop(next);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.xl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Filters & sort', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: AppSpacing.md),
            DropdownButtonFormField<AuctionSearchSort>(
              key: ValueKey<AuctionSearchSort>(_sort),
              initialValue: _sort,
              decoration: const InputDecoration(
                labelText: 'Sort',
                border: OutlineInputBorder(),
              ),
              items: AuctionSearchSort.values
                  .map(
                    (s) => DropdownMenuItem(
                      value: s,
                      child: Text(s.label),
                    ),
                  )
                  .toList(),
              onChanged: (v) {
                if (v != null) setState(() => _sort = v);
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DropdownButtonFormField<String>(
              key: ValueKey<String>(_status),
              initialValue: _status,
              decoration: const InputDecoration(
                labelText: 'Status',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'LIVE', child: Text('Live')),
                DropdownMenuItem(value: 'ENDED', child: Text('Ended')),
                DropdownMenuItem(value: 'SOLD', child: Text('Sold')),
              ],
              onChanged: (v) {
                if (v != null) setState(() => _status = v);
              },
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _q,
              decoration: const InputDecoration(
                labelText: 'Search title / make / model',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _yearMin,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Year min',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: TextField(
                    controller: _yearMax,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Year max',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _priceMin,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      labelText: 'Min price (USD)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: TextField(
                    controller: _priceMax,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      labelText: 'Max price (USD)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _mileageMin,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Mileage min',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: TextField(
                    controller: _mileageMax,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Mileage max',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _location,
              decoration: const InputDecoration(
                labelText: 'Location (zip / text)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _zip,
                    decoration: const InputDecoration(
                      labelText: 'Zip (radius filter)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: TextField(
                    controller: _radius,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Radius (mi)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            DropdownButtonFormField<String?>(
              key: ValueKey<String?>(_condition),
              initialValue: _condition,
              decoration: const InputDecoration(
                labelText: 'Condition',
                border: OutlineInputBorder(),
              ),
              items: _conditions
                  .map(
                    (c) => DropdownMenuItem<String?>(
                      value: c,
                      child: Text(c == null ? 'Any' : c.replaceAll('_', ' ')),
                    ),
                  )
                  .toList(),
              onChanged: (v) => setState(() => _condition = v),
            ),
            const SizedBox(height: AppSpacing.sm),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('No reserve'),
              value: _noReserve,
              onChanged: (v) => setState(() => _noReserve = v),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Ending in 24h'),
              value: _endingSoon,
              onChanged: (v) => setState(() => _endingSoon = v),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Featured only'),
              subtitle: Text(
                'API accepts this; may not filter until backend adds a featured field.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textTertiary),
              ),
              value: _featuredOnly,
              onChanged: (v) => setState(() => _featuredOnly = v),
            ),
            const SizedBox(height: AppSpacing.lg),
            FilledButton(onPressed: _apply, child: const Text('Apply filters')),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
          ],
        ),
      ),
    );
  }
}
