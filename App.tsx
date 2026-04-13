import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types
interface Todo {
  id: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem('todos');
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      console.error('Failed to load todos from storage', error);
    }
  };

  const saveTodos = async (todos: Todo[]) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos to storage', error);
    }
  };

  const addTodo = () => {
    if (!description || !dueDate) {
      Alert.alert('Error', 'Please enter a description and a due date.');
      return;
    }
    const newTodo: Todo = {
      id: Date.now().toString(),
      description,
      completed: false,
      priority,
      dueDate,
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    setDescription('');
    setDueDate('');
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'incomplete') return !todo.completed;
    return true;
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Todo Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Due Date (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
      />
      <View style={styles.priorityContainer}>
        {['low', 'medium', 'high'].map(level => (
          <TouchableOpacity key={level} onPress={() => setPriority(level as 'low' | 'medium' | 'high')}>
            <Text style={[styles.priority, priority === level && styles.selectedPriority]}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title="Add Todo" onPress={addTodo} />
      <View style={styles.filterContainer}>
        {['all', 'completed', 'incomplete'].map(status => (
          <TouchableOpacity key={status} onPress={() => setFilter(status as 'all' | 'completed' | 'incomplete')}>
            <Text style={[styles.filter, filter === status && styles.selectedFilter]}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredTodos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <Text style={item.completed ? styles.completed : styles.description}>{item.description} (Due: {item.dueDate}) - Priority: {item.priority}</Text>
            <Button title={item.completed ? 'Undo' : 'Complete'} onPress={() => toggleTodo(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e94560',
    color: '#fff',
    padding: 10,
    marginVertical: 5,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  priority: {
    color: '#e94560',
  },
  selectedPriority: {
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  filter: {
    color: '#e94560',
  },
  selectedFilter: {
    fontWeight: 'bold',
  },
  todoItem: {
    marginVertical: 5,
  },
  description: {
    color: '#fff',
  },
  completed: {
    color: '#00ff41',
    textDecorationLine: 'line-through',
  },
});

export default App;