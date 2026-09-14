import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import discenteAuthRoutes from './services/discenteAuth';

discenteAuthRoutes.init();

export default function App() {
  const [modo, setModo] = useState('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [curso, setCurso] = useState('');
  const [senha, setSenha] = useState('');

  const handleLoginDiscente = () => {
    try {
      const usuario = discenteAuthRoutes.login(email, senha);
      Alert.alert('Login realizado', `Bem-vindo(a), ${usuario.nome_completo}.`);
    } catch (error) {
      Alert.alert('Erro de login', error.message);
    }
  };

  const handleCadastroDiscente = () => {
    try {
      const novoDiscente = discenteAuthRoutes.register({
        nome_completo: nome,
        email_institucional: email,
        matricula,
        senha,
        curso,
      });

      Alert.alert('Cadastro realizado', `Discente cadastrado: ${novoDiscente.nome_completo}`);
      setModo('login');
      setNome('');
      setEmail('');
      setMatricula('');
      setCurso('');
      setSenha('');
    } catch (error) {
      Alert.alert('Erro no cadastro', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.card}>
        <Text style={styles.title}>Avisa</Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, modo === 'login' && styles.tabButtonActive]}
            onPress={() => setModo('login')}
          >
            <Text style={styles.tabText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, modo === 'cadastro' && styles.tabButtonActive]}
            onPress={() => setModo('cadastro')}
          >
            <Text style={styles.tabText}>Cadastro</Text>
          </TouchableOpacity>
        </View>

        {modo === 'login' ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email institucional"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.primaryButtonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={styles.input}
              placeholder="Email institucional"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Matrícula"
              autoCapitalize="none"
              value={matricula}
              onChangeText={setMatricula}
            />

            <TextInput
              style={styles.input}
              placeholder="Curso"
              value={curso}
              onChangeText={setCurso}
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleCadastro}>
              <Text style={styles.primaryButtonText}>Cadastrar discente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#204c63',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#dcebf0',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#204c63',
  },
  tabText: {
    color: '#204c63',
    fontWeight: '700',
  },
  tabButtonActiveText: {
    color: '#fff',
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#b5ccd6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#f9fbfc',
  },
  primaryButton: {
    backgroundColor: '#1b6a7b',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
