import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CheckSquare, MagnifyingGlass, Square } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Screen } from '../../shared/ui/Screen';
import { useAppStore } from '../../app/providers/store/useAppStore';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ConversionHistoryCard } from '../../widgets/conversion-card/ConversionHistoryCard';
import { formatDateLabel } from '../../shared/lib/date';
import { HistoryItem } from '../../types/models';
import { Button } from '../../shared/ui/Button';

type TimeFilter = 'all' | 'today' | 'week' | 'month';

type HistoryRow =
  | { type: 'section'; title: string; id: string }
  | { type: 'item'; item: HistoryItem; id: string };

const FILTERS: Array<{ id: TimeFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

export const HistoryScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const history = useAppStore(state => state.history);
  const removeHistoryItem = useAppStore(state => state.removeHistoryItem);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const now = new Date();
    return history.filter(item => {
      const matchQuery =
        !query ||
        item.source.fileName.toLowerCase().includes(query.toLowerCase()) ||
        item.source.format.includes(query.toLowerCase()) ||
        item.outputFormat.includes(query.toLowerCase());

      if (!matchQuery) {
        return false;
      }

      if (filter === 'all') {
        return true;
      }

      const date = new Date(item.createdAt);
      const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (filter === 'today') {
        return days === 0;
      }
      if (filter === 'week') {
        return days <= 7;
      }
      return days <= 31;
    });
  }, [filter, history, query]);

  const rows = useMemo<HistoryRow[]>(() => {
    const groups = new Map<string, HistoryItem[]>();
    filtered.forEach(item => {
      const key = formatDateLabel(item.createdAt);
      const existing = groups.get(key) ?? [];
      existing.push(item);
      groups.set(key, existing);
    });

    const result: HistoryRow[] = [];
    groups.forEach((items, key) => {
      result.push({ type: 'section', title: key, id: `section-${key}` });
      items.forEach(item => result.push({ type: 'item', item, id: item.id }));
    });

    return result;
  }, [filtered]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const deleteSelected = () => {
    selectedIds.forEach(id => removeHistoryItem(id));
    setSelectedIds([]);
    setEditMode(false);
  };

  return (
    <Screen>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}> 
        <Text style={[theme.typography.headlineMedium, { color: theme.colors.textPrimary }]}>History</Text>
        <Pressable onPress={() => setEditMode(prev => !prev)}>
          <Text style={[theme.typography.labelLarge, { color: theme.colors.primary }]}> 
            {editMode ? 'Done' : 'Edit'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.search, { backgroundColor: theme.colors.surfaceSecondary }]}> 
          <MagnifyingGlass color={theme.colors.textMuted} size={18} />
          <TextInput
            onChangeText={setQuery}
            placeholder="Search conversions..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}
            value={query}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(item => (
          <Pressable
            key={item.id}
            onPress={() => setFilter(item.id)}
            style={[
              styles.filterTab,
              filter === item.id && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                theme.typography.labelMedium,
                {
                  color: filter === item.id ? theme.colors.primary : theme.colors.textMuted,
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {rows.length ? (
        <FlatList
          contentContainerStyle={{ paddingBottom: editMode ? 90 : 20 }}
          data={rows}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            if (item.type === 'section') {
              return (
                <Text style={[styles.sectionTitle, theme.typography.titleSmall, { color: theme.colors.textMuted }]}> 
                  {item.title}
                </Text>
              );
            }

            const selected = selectedIds.includes(item.item.id);
            return (
              <View style={styles.itemRow}>
                {editMode ? (
                  <Pressable
                    onPress={() => toggleSelection(item.item.id)}
                    style={styles.checkbox}
                  >
                    {selected ? (
                      <CheckSquare color={theme.colors.primary} size={22} weight="fill" />
                    ) : (
                      <Square color={theme.colors.textMuted} size={22} weight="regular" />
                    )}
                  </Pressable>
                ) : null}
                <View style={styles.itemCardWrap}>
                  <ConversionHistoryCard
                    item={item.item}
                    onPress={() => navigation.navigate('Preview', { result: item.item })}
                  />
                </View>
              </View>
            );
          }}
        />
      ) : (
        <EmptyState
          actionLabel="Convert an Image"
          description="Your conversion history will appear here. Start by converting your first image."
          onAction={() => navigation.navigate('Convert')}
          title="No Conversions Yet"
        />
      )}

      {editMode ? (
        <View style={[styles.editFooter, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }]}> 
          <Button
            disabled={selectedIds.length === 0}
            fullWidth
            label={`Delete Selected (${selectedIds.length})`}
            onPress={deleteSelected}
            variant="destructive"
          />
        </View>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  search: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    height: 44,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  filterTab: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 10,
  },
  sectionTitle: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  checkbox: {
    marginLeft: 16,
    width: 24,
  },
  itemCardWrap: {
    flex: 1,
  },
  editFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
  },
});
