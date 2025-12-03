import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS } from '../constants/colors';

const SortModal = ({ visible, onClose, sortBy, onSortChange }) => {
  return (
    <View 
      style={styles.wrapper} 
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {visible && (
        <>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.container}>
            <View style={styles.modal}>
          <Text style={styles.title}>Sort by:</Text>
          
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onSortChange('number');
              onClose();
            }}
          >
            <View style={styles.radio}>
              {sortBy === 'number' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.optionText}>Number</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onSortChange('name');
              onClose();
            }}
          >
            <View style={styles.radio}>
              {sortBy === 'name' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.optionText}>Name</Text>
          </TouchableOpacity>
        </View>
      </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  container: {
    position: 'absolute',
    top: 164,
    right: 20,
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 180,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 12,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    color: '#333',
    fontSize: 15,
  },
});

export default SortModal;

