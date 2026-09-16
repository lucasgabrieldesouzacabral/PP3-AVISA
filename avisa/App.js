import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import discenteAuthRoutes from './services/discenteAuth';
import HtmlRoute from './screens/HtmlRoute';

export default function App() {
  const [route, setRoute] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    discenteAuthRoutes.init();
  }, []);

  const handleMessage = (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'route') {
        const nextRoute =
          data.route === 'cadastro.html'
            ? 'cadastro'
            : data.route === 'inicio.html'
              ? 'inicio'
              : data.route === 'perfil.html'
                ? 'perfil'
                : 'login';
        if (nextRoute === 'login') setUser(null);
        setRoute(nextRoute);
        return;
      }

      if (data.type === 'login') {
        const usuario = discenteAuthRoutes.login(data.email, data.password);
        setUser(usuario);
        setRoute('inicio');
        Alert.alert('Login realizado', `Bem-vindo(a), ${usuario.nome_completo}.`);
        return;
      }

      if (data.type === 'register') {
        if (data.role !== 'Discente') {
          throw new Error('Neste momento, o cadastro disponível é apenas para discentes.');
        }

        const usuario = discenteAuthRoutes.register({
          nome_completo: data.name,
          email_institucional: data.email,
          matricula: data.matricula,
          senha: data.password,
          curso: data.curso,
        });

        setRoute('login');
        Alert.alert('Cadastro realizado', `Discente cadastrado: ${usuario.nome_completo}`);
      }
    } catch (error) {
      Alert.alert('Não foi possível concluir', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <HtmlRoute route={route} user={user} onMessage={handleMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
