import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts } from '@/theme';

export type DateRangeValue = {
  startDate: Date;
  endDate: Date;
  label?: string;
};

export type PresetRange = {
  label: string;
  startDate: Date;
  endDate: Date;
};

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function normalizeDate(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isDateBetween(target: Date, start: Date, end: Date): boolean {
  const t = normalizeDate(target).getTime();
  const s = normalizeDate(start).getTime();
  const e = normalizeDate(end).getTime();
  return t > s && t < e;
}

export function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDayMonth(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function defaultRangeLabel(start: Date, end: Date): string {
  if (isSameDay(start, end)) {
    return formatDateShort(start);
  }
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    const sDay = String(start.getDate()).padStart(2, '0');
    const eDay = String(end.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[start.getMonth()].slice(0, 3);
    return `${sDay}–${eDay} ${month} ${start.getFullYear()}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${formatDayMonth(start)} – ${formatDateShort(end)}`;
  }
  return `${formatDateShort(start)} – ${formatDateShort(end)}`;
}

export const DEFAULT_REPORT_PRESETS: PresetRange[] = [
  {
    label: '01–08 Oct 2026',
    startDate: new Date(2026, 9, 1),
    endDate: new Date(2026, 9, 8),
  },
  {
    label: '01–30 Sep 2026',
    startDate: new Date(2026, 8, 1),
    endDate: new Date(2026, 8, 30),
  },
  {
    label: 'May–Oct 2026',
    startDate: new Date(2026, 4, 1),
    endDate: new Date(2026, 9, 31),
  },
];

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (range: DateRangeValue) => void;
  label?: string;
  presets?: PresetRange[];
  style?: StyleProp<ViewStyle>;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  presets = DEFAULT_REPORT_PRESETS,
  style,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Working state inside modal
  const [tempStart, setTempStart] = useState<Date>(startDate);
  const [tempEnd, setTempEnd] = useState<Date>(endDate);
  const [viewMonth, setViewMonth] = useState<number>(startDate.getMonth());
  const [viewYear, setViewYear] = useState<number>(startDate.getFullYear());

  const handleOpen = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setViewMonth(startDate.getMonth());
    setViewYear(startDate.getFullYear());
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleApply = () => {
    const s = tempStart <= tempEnd ? tempStart : tempEnd;
    const e = tempStart <= tempEnd ? tempEnd : tempStart;
    onChange({
      startDate: s,
      endDate: e,
      label: defaultRangeLabel(s, e),
    });
    setOpen(false);
  };

  const handleSelectPreset = (p: PresetRange) => {
    setTempStart(p.startDate);
    setTempEnd(p.endDate);
    setViewMonth(p.startDate.getMonth());
    setViewYear(p.startDate.getFullYear());
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayPress = (day: number) => {
    const clickedDate = new Date(viewYear, viewMonth, day);

    // If start is chosen and end is still identical or not finalized, complete the range
    if (tempStart && tempEnd && isSameDay(tempStart, tempEnd)) {
      if (clickedDate.getTime() < tempStart.getTime()) {
        setTempEnd(tempStart);
        setTempStart(clickedDate);
      } else {
        setTempEnd(clickedDate);
      }
    } else {
      // Start a new range
      setTempStart(clickedDate);
      setTempEnd(clickedDate);
    }
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const totalDays = lastDay.getDate();
    // 0 = Monday, ..., 6 = Sunday
    const startOffset = (firstDay.getDay() + 6) % 7;

    const days: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [viewYear, viewMonth]);

  const activePreset = presets.find(
    (p) => isSameDay(p.startDate, tempStart) && isSameDay(p.endDate, tempEnd),
  );

  const displayLabel = useMemo(() => {
    const matched = presets.find(
      (p) => isSameDay(p.startDate, startDate) && isSameDay(p.endDate, endDate),
    );
    return matched ? matched.label : defaultRangeLabel(startDate, endDate);
  }, [startDate, endDate, presets]);

  const diffDays = Math.max(
    1,
    Math.round(Math.abs(tempEnd.getTime() - tempStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={[styles.inputBox, style]}
        accessibilityRole="button"
        accessibilityLabel={`Date range: ${displayLabel}`}
      >
        <View style={styles.inputLeft}>
          <Feather name="calendar" size={17} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.inputText} numberOfLines={1}>
            {displayLabel}
          </Text>
        </View>
        <Feather name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdropPress} onPress={handleClose} />

          <View
            style={[
              styles.modalCard,
              {
                width: Math.min(width - 32, isLandscape ? 480 : 380),
                maxHeight: Math.min(height - 40, isLandscape ? 380 : 580),
              },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="calendar" size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>Select Date Range</Text>
              </View>
              <Pressable onPress={handleClose} hitSlop={10} style={styles.closeBtn}>
                <Feather name="x" size={18} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              {/* Presets */}
              {presets.length > 0 ? (
                <View style={styles.presetsRow}>
                  {presets.map((p) => {
                    const isSelected = activePreset?.label === p.label;
                    return (
                      <Pressable
                        key={p.label}
                        onPress={() => handleSelectPreset(p)}
                        style={[styles.presetChip, isSelected && styles.presetChipActive]}
                      >
                        <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                          {p.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {/* Month Navigation */}
              <View style={styles.navRow}>
                <Pressable onPress={handlePrevMonth} hitSlop={8} style={styles.navArrow}>
                  <Feather name="chevron-left" size={20} color={colors.text} />
                </Pressable>
                <Text style={styles.monthTitle}>
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </Text>
                <Pressable onPress={handleNextMonth} hitSlop={8} style={styles.navArrow}>
                  <Feather name="chevron-right" size={20} color={colors.text} />
                </Pressable>
              </View>

              {/* Weekday labels */}
              <View style={styles.weekRow}>
                {WEEKDAYS.map((w) => (
                  <Text key={w} style={styles.weekDayText}>
                    {w}
                  </Text>
                ))}
              </View>

              {/* Day grid */}
              <View style={styles.grid}>
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <View key={`empty-${idx}`} style={styles.cell} />;
                  }

                  const thisDate = new Date(viewYear, viewMonth, day);
                  const isStart = isSameDay(thisDate, tempStart);
                  const isEnd = isSameDay(thisDate, tempEnd);
                  const inBetween = isDateBetween(thisDate, tempStart, tempEnd);

                  return (
                    <View
                      key={`day-${day}`}
                      style={[
                        styles.cell,
                        inBetween && styles.cellBetween,
                        isStart && !isEnd && styles.cellRangeStart,
                        isEnd && !isStart && styles.cellRangeEnd,
                      ]}
                    >
                      <Pressable
                        onPress={() => handleDayPress(day)}
                        style={[
                          styles.dayButton,
                          (isStart || isEnd) && styles.dayButtonSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            (isStart || isEnd) && styles.dayTextSelected,
                            inBetween && styles.dayTextBetween,
                          ]}
                        >
                          {day}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              {/* Readout Summary */}
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Selected Range:</Text>
                <Text style={styles.summaryValue}>
                  {formatDateShort(tempStart <= tempEnd ? tempStart : tempEnd)} –{' '}
                  {formatDateShort(tempStart <= tempEnd ? tempEnd : tempStart)}
                  <Text style={styles.summaryCount}> ({diffDays} days)</Text>
                </Text>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <Pressable onPress={handleClose} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleApply} style={styles.applyBtn}>
                <Text style={styles.applyBtnText}>Apply Range</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inputBox: {
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  inputText: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.text,
    flexShrink: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdropPress: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  presetChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.cardMuted,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetChipActive: {
    backgroundColor: colors.card,
    borderColor: colors.primary,
  },
  presetText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.textMuted,
  },
  presetTextActive: {
    color: colors.primary,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  navArrow: {
    padding: 6,
    borderRadius: 8,
  },
  monthTitle: {
    fontFamily: fonts.heading,
    fontSize: 15.5,
    color: colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  cell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 1,
  },
  cellBetween: {
    backgroundColor: '#FDEEE5',
  },
  cellRangeStart: {
    backgroundColor: '#FDEEE5',
    borderTopLeftRadius: 19,
    borderBottomLeftRadius: 19,
  },
  cellRangeEnd: {
    backgroundColor: '#FDEEE5',
    borderTopRightRadius: 19,
    borderBottomRightRadius: 19,
  },
  dayButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.text,
  },
  dayTextSelected: {
    color: '#ffffff',
    fontFamily: fonts.bodyBold,
  },
  dayTextBetween: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
  },
  summaryBox: {
    backgroundColor: colors.cardMuted,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  summaryLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 13.5,
    color: colors.text,
    marginTop: 2,
  },
  summaryCount: {
    color: colors.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  cancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.text,
  },
  applyBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: '#ffffff',
  },
});
