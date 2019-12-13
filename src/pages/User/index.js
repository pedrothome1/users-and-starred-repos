import React, { Component } from 'react';
import { ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';
import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  OwnerAvatar,
  Starred,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    page: 1,
    loading: false,
    refreshing: false,
  };

  async componentDidMount() {
    const user = this.getUser();

    this.setState({ loading: true });

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({
      stars: response.data,
      loading: false,
    });
  }

  getUser = () => {
    const { navigation } = this.props;
    return navigation.getParam('user');
  };

  loadMore = async () => {
    const user = this.getUser();
    const { page, stars } = this.state;
    const newPage = page + 1;

    const response = await api.get(
      `/users/${user.login}/starred?page=${newPage}`
    );

    this.setState({
      stars: [...stars, ...response.data],
      page: newPage,
    });
  };

  refreshList = async () => {
    this.setState({ refreshing: true });

    const user = this.getUser();
    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({
      stars: response.data,
      page: 1,
      refreshing: false,
    });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;
    const user = this.getUser();

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ActivityIndicator
            color="#999"
            size="large"
            style={{ marginTop: 20 }}
          />
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            renderItem={({ item }) => (
              <TouchableWithoutFeedback
                onPress={() =>
                  navigation.navigate('Repository', { repository: item })
                }
              >
                <Starred>
                  <OwnerAvatar source={{ uri: item.owner.avatar_url }} />

                  <Info>
                    <Title>{item.name}</Title>
                    <Author>{item.owner.login}</Author>
                  </Info>
                </Starred>
              </TouchableWithoutFeedback>
            )}
          />
        )}
      </Container>
    );
  }
}
