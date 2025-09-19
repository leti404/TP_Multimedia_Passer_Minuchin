import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Button, ScrollView, Image, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  // Estados con tipos explícitos
  const [text, setText] = useState<string>('');
  const [clipboardContent, setClipboardContent] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Cargar historial inicial
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('clipboardHistory');
      if (stored) setHistory(JSON.parse(stored));
    })();
  }, []);

  // Guardar historial en AsyncStorage
  const saveHistory = async (value: string) => {
    const updated: string[] = [value, ...history].slice(0, 5);
    setHistory(updated);
    await AsyncStorage.setItem('clipboardHistory', JSON.stringify(updated));
  };

  // Copiar texto
  const copyText = async () => {
    await Clipboard.setStringAsync(text);
    await saveHistory(text);
    Alert.alert('Copiado', 'Texto copiado al portapapeles');
  };

  // Cortar texto
  const cutText = async () => {
    await Clipboard.setStringAsync(text);
    await saveHistory(text);
    setText('');
    Alert.alert('Cortado', 'Texto cortado al portapapeles');
  };

  // Pegar texto
  const pasteText = async () => {
    const content = await Clipboard.getStringAsync();
    setText(content);
  };

  // Mostrar clipboard actual
  const showClipboard = async () => {
    const content = await Clipboard.getStringAsync();
    setClipboardContent(content);
  };

  // Elegir imagen y copiar
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      try {
        await Clipboard.setImageAsync(uri);
        await saveHistory('[Imagen]');
        Alert.alert('Imagen', 'Imagen copiada al portapapeles (si la plataforma lo soporta)');
      } catch (e) {
        Alert.alert('Error', 'Copiar imágenes no está soportado en esta plataforma');
      }
    }
  };

  // Pegar imagen (experimental)
  const pasteImage = async () => {
    try {
      const img = await Clipboard.getImageAsync({ format: 'png' });
      if (img && img.data) {
        setImageUri('data:image/png;base64,' + img.data);
        Alert.alert('Imagen', 'Imagen pegada desde el portapapeles');
      } else {
        Alert.alert('Sin imagen', 'No hay imagen en portapapeles');
      }
    } catch {
      Alert.alert('Error', 'No se pudo pegar imagen en esta plataforma');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo Clipboard</Text>

      <TextInput
        style={styles.input}
        placeholder="Escribe aquí..."
        value={text}
        onChangeText={setText}
      />

      <View style={styles.buttons}>
        <Button title="Copy" onPress={copyText} />
        <Button title="Cut" onPress={cutText} />
        <Button title="Paste" onPress={pasteText} />
      </View>

      <Button title="Mostrar Clipboard actual" onPress={showClipboard} />
      <Text>Clipboard actual: {clipboardContent}</Text>

      <View style={styles.imgButtons}>
        <Button title="Elegir imagen y copiar" onPress={pickImage} />
        <Button title="Pegar imagen" onPress={pasteImage} />
      </View>
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 200, height: 200, marginTop: 10 }}
        />
      )}

      <Text style={styles.subtitle}>Historial (últimos 5):</Text>
      <ScrollView>
        {history.map((item, i) => (
          <Text key={i}>- {item}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { marginTop: 20, fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  imgButtons: { marginVertical: 10 },
});
