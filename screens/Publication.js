//galio
import { Block, Text, theme } from "galio-framework";
import {
  Dimensions,
  View,
  Image,
  ImageBackground,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  RefreshControl,
  Platform,
  FlatList,
  Button,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native";
import { SwipeListView } from 'react-native-swipe-list-view';
import { Images, argonTheme, articles } from "../constants/";
import { Card } from "../components/";
import React from "react";
import * as SecureStore from 'expo-secure-store';
import {numberFormat, apiClient} from '../constants/utils'
const { width } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;
const cardWidth = width - theme.SIZES.BASE * 2;


class Publication extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token:null,
      connection:null,
      post_id:null,
      publications:null,
      refreshing:false,
      objpost:null,
      objcampaign:null,
    }
  }

  async getToken() {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t});
    });
  }

  async getPost(post_id) {
    try {
      await apiClient.get('post/'+post_id, 
      { headers: {Authorization: 'Bearer ' + this.state.token}})
      .then(r => {
        this.setState({
            objpost:r.data.post.publications,
            objcampaign:r.data.post.campaign
        })
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
  }

  async getPublications(connection) {
    try {
      await apiClient.get('user/social-connections/'+connection+'/posts', 
      { 
        headers: {Authorization: 'Bearer ' + this.state.token}
      }).then(r => {
        let data = r.data;
        this.setState({publications:data});
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
  }

  assocPost = async (connection ,post_id, publication_id) => {
    await apiClient.post('publications', {
        post_id:post_id,
        social_connection_id:connection,
        social_connection_post_id:publication_id
    },
    { 
        headers: {Authorization: 'Bearer ' + this.state.token}
    }).then(r =>{
        console.log(r.data);
        Alert.alert('post bound');
        this.getPost(post_id);
    }).catch(e => { 
        console.log(e);
    }).finally(()=>{});
    await console.log(connection ,post_id, publication_id);
  }

  componentDidUpdate(prevProps, prevState) {
    try {
      const { connection, post_id } = this.props.route.params
      //Ensuring This is not the first call to the server
      if(connection && connection !== this.state.connection) {
        this.setState({
            connection:connection,
            post_id:post_id
        });
        this.getPublications(connection);
        this.getPost(post_id);
      }
    } catch(error) {
      console.log(error);
    };
  }

  shouldComponentUpdate(nextProp, nextState) {
    return true;
  }

  componentDidMount() {
    this.getToken();
  }

  
 

  render() {
    const {publications, connection, post_id, objcampaign, objpost} = this.state;

    return (
      <Block flex center>
        {objcampaign && (
        <Block >
            <Block row  style={[styles.card, styles.shadow]}>
                  
                    <Block flex style={[styles.imageContainer]}>
                      <Image source={{uri:objcampaign.cover_url}} style={styles.avatar} />
                    </Block>
          
                    <Block flex={3} ver space="between" style={styles.cardDescription}>
                      <Text size={14} >Enrolled campaign:</Text>
                      <Text size={14}  bold>{objcampaign.name}</Text>
                      <Text size={14}  >bound posts: {objpost.length}</Text>
                    </Block>

            </Block>
        </Block>
        )}
        <Block flex={7.9}>
        <Text center size={14} style={styles.title} bold >Post available</Text>
        <FlatList
            data={publications}
            renderItem={({item, index, separators}) => (
              <Block row flex style={[styles.card, styles.shadow]} key={item.id}>
              <TouchableWithoutFeedback onPress={() => this.assocPost(connection,post_id,item.id)}>
                <Block flex style={[styles.imageContainer,styles.horizontalStyles, styles.shadow]}>
                  <Image source={{uri:item.thumbnail}} style={styles.horizontalImage} />
                </Block>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => this.assocPost(connection,post_id,item.id)}>
                <Block flex space="between" style={styles.cardDescription}>
                  <Text size={14} style={styles.cardTitle} color={argonTheme.COLORS.MUTED}></Text>
                  <Text size={14} style={styles.cardTitle} color={argonTheme.COLORS.PRIMARY} bold>Bind this post to enrolled campaign</Text>
  
                </Block>
              </TouchableWithoutFeedback>
            </Block>
            )}
            refreshing={false}
            onRefresh={() => this.getPublications(connection)}
        />
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    paddingBottom: theme.SIZES.BASE,
    paddingHorizontal: theme.SIZES.BASE * 2,
    marginTop: 22,
    color: argonTheme.COLORS.HEADER,
  },
  titleHead: {
    paddingBottom: theme.SIZES.BASE,
    paddingLeft: 22,
    marginTop: 22,
    color: argonTheme.COLORS.HEADER,
  },
  group: {
    paddingTop: theme.SIZES.BASE,
  },
  albumThumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure,
  },
  category: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE / 2,
    borderWidth: 0,
  },
  categoryTitle: {
    height: "100%",
    paddingHorizontal: theme.SIZES.BASE,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageBlock: {
    overflow: "hidden",
    borderRadius: 4,
  },
  productItem: {
    width: cardWidth - theme.SIZES.BASE * 2,
    marginHorizontal: theme.SIZES.BASE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    shadowOpacity: 0.2,
  },
  productImage: {
    width: cardWidth - theme.SIZES.BASE,
    height: cardWidth - theme.SIZES.BASE,
    borderRadius: 3,
  },
  productPrice: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
  },
  productDescription: {
    paddingTop: theme.SIZES.BASE,
    // paddingBottom: theme.SIZES.BASE * 2,
  },
  rowBack: {
    alignItems: 'center',   
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 16,
    justifyContent: 'center',
    position: 'absolute',
    top: 16,
    width: 75,
    borderRadius: 10
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
  },
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 120,
    marginBottom: 16,
    width:cardWidth,
  },
  cardTitle: {
    flex: 1,
    flexWrap: 'wrap',
    paddingBottom: 6
    
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  image: {
    // borderRadius: 3,
  },
  horizontalImage: {
    height: 120,
    width: 'auto',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0
  },
  fullImage: {
    height: 215
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: 10,
    borderWidth: 0,
    width:cardWidth,
    borderRadius: 10,

  },
  cardTitle: {
    flex: 1,
    flexWrap: 'wrap',
    paddingBottom: 6
    
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: 'hidden',
 
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginTop: -80
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0,
    marginVertical:5,
    marginHorizontal:5
  },
});

export default Publication;
