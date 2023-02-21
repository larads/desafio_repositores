import { StatusBar } from 'expo-status-bar'; // statusbar controla a barra de status do app.
import { StyleSheet, Text, View, Button, TextInput, FlatList, Alert } from 'react-native'; // importando os componetes no react
import { useEffect, useState } from 'react'; // importando hooks no react
import axios from 'axios'; //importando axios
import SQLite from 'react-native-sqlite-storage';

export default function App() {  //
  const [repositorios, setRepositorios] = useState([]); // utilizando hooks useSate, retorna array como resultado
  const senhaCorreta='desafio2023'

  useEffect(() => {
    initializeDatabase();
  }, []);

  function initializeDatabase() { // iniciando o banco de dados 
    const db = SQLite.openDatabase({ name: 'test.db', location: 'default'});
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS repositorio (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT)');
    });
  }

  function fetchData(users){ // utilizando a requesicao GET
    if (senha === senhaCorreta) { // si a senha preechida e a mesma que a senhaCorreta logar continuar, caso não for a mesma ele exibira uma mensagem
      axios.get(`https://api.github.com/users/${users}/repos`) // utilizando a  biblioteca axios, para fazer chamadas de API HTTP no react
      .then(response => {setRepositorios(response.data); saveDataToDataBase(response.data);}) // ele retorna a chamada API e atualiza o estado do React com os dados recebidos da API.
      .catch(error => console.log(error)); // ele retorna a chamada API e se a função recebe o erro ele o registra no console do navegador ou seja console.log
  } else {
    alert('senha Incorreta !'); // ele mostrara essa mensagem caso a senha for incorreta
  }
    }

    function saveDataToDatabase(data) {
      const db = SQLite.openDatabase({ name: 'test.db' });
      db.transaction(tx => {
        data.forEach(item => {
          tx.executeSql('INSERT INTO repositorio (name, description) VALUES (?, ?)', [
            item.name, item.description, ]);
        });
      });
    }

    function createRepositorio(repositorio) { // Implementando CRUD (create)
      const db = SQLite.openDatabase({ name: 'test.db' });
          db.transaction(tx => { tx.executeSql('INSERT INTO repositorio (name, description) VALUES (?, ?)', [
              nomeRepositorio, descricaoRepositorio,
            ]).then(result => {setRepositorios([...repositorios, { id: result.insertId, name: nomeRepositorio, description: descricaoRepositorio }]);
              Alert.alert('Sucesso', 'Repositório inserido no banco de dados com sucesso.');
            });
          });
        }

    function updateRepositorio(id, updatedRepositorio) { // implementar CRUD (Update)
      axios.patch(`https://api.github.com/repos/${id}`, updatedRepositorio)
        .then(response => {
          const newRepositorios = repositorios.map(repositorio => {
            if (repositorio.id === id) {
              return response.data;
            }
            return repositorio;
          });
          setRepositorios(newRepositorios);
        })
        .catch(error => console.log(error));
    }

    function deleteRepositorio(id) { // implementar CRUD (delete)
      axios.delete(`https://api.github.com/repos/${id}`)
        .then(() => {
          const newRepositorios = repositorios.filter(repositorio => repositorio.id !== id);
          setRepositorios(newRepositorios);
        })
        .catch(error => console.log(error));
    }

  const [users, setUser] = useState(''); // decalarando as variaveis e retornando com arrays. por exemplo se o valor inicial é uma string vazia.ele pode ser usado para armazenar dados que podem ser atualizados.
  const [senha, setSenha] = useState(''); //decalarando as variaveis e retornando com arrays. por exemplo se o valor inicial é uma string vazia.ele pode ser usado para armazenar dados que podem ser atualizados.
  const [nomeRepositorio, setNomeRepositorio] = useState('');
  const [descricaoRepositorio, setDescricaoRepositorio] = useState('');

  const renderItem = ({ item }) => ( // a funcao renderItem e usada para mapear os dados e exibir a inf na tela.
    <View style={styles.item}> 
      <Text style={styles.title}>{item.name}</Text>
      <Text>{item.description}</Text>
      <Text>{item.private ? 'private' : 'public'}</Text> 
    </View>
  );
  //item.description mostra a descrição de cada item individual na lista.
  //item.private mostra se o repositorio fornecido e publico ou privado.

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text> LOGIN</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Usuário"
          onChangeText={text => setUser(text)}
          value={users}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          onChangeText={text => setSenha(text)}
          value={senha}
          secureTextEntry={true}
        />
        <Button
          title="Entrar"
          onPress={() => fetchData(users)} //
          buttonStyle={styles.button}
        />
        <TextInput
          style={styles.input}
          placeholder="Nome do Repositório"
          onChangeText={text => setNomeRepositorio(text)}
          value={nomeRepositorio}
        />
        <TextInput
          style={styles.input}
          placeholder="Descrição do Repositório"
          onChangeText={text => setDescricaoRepositorio(text)}
          value={descricaoRepositorio}
        />
        <Button
          title='Criar'
          onPress={() => createRepositorio({
            name: nomeRepositorio,
            description: descricaoRepositorio,
          })}
        />
      </View>
      {repositorios.length > 0 ? (  // se o comprimento do array "repositorios" é maior que zero. Se a condição for verdadeira, ele será executado, se não será ignorado. e sera exibida a mensagem.      
      <FlatList // ele vai permitir uma lista de dados de maneira eficiente, especialmente quando se trata de grandes conjuntos de dados. 
        data={repositorios}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
        ) : (
          <Text style={styles.noData}> O usuario informado não possui nenhum Repositorio !</Text>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    flex: 1,
    flexDirection: "column"
  },
  header: {
    backgroundColor: '$FFFFFF',
    marginTop: 80,
    marginLeft: 15
  },
  form: {
    marginHorizontal: 15
  },
  input: {
    backgroundColor: "#fff",
    height: 50,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 10
  },
  button: {
    backgroundColor: "#009688",
    borderRadius: 10,
    height: 50,
    marginVertical: 20 
  },
  item: {
    backgroundColor: '#9370DB',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
    color: '#FF00FF'
  },
});