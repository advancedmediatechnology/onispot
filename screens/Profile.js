import React from "react";
import * as SecureStore from 'expo-secure-store';
import {
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  Alert,
  Platform
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Block, Text, theme, Button } from "galio-framework";
import { Images, argonTheme } from "../constants";
import Icon from "../components/Icon";
import { HeaderHeight, apiClient } from "../constants/utils";
const { width, height } = Dimensions.get("screen");
const thumbMeasure = (width - 48 - 32) / 3;



class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      token:null,
      socials:null,
    };
  }

  async getToken() {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t});
        this.getUser();
        this.getSocial();
    });
  }

  async getUser() {
    await apiClient.post('user', 
    { },
    { headers: {Authorization: 'Bearer ' + this.state.token}}).then(r => {
      console.log(r.data);
      this.setState({ 
        prefcategories: r.data.categories, 
        prefstyles: r.data.styles, 
        name: r.data.name, 
        birthdate: r.data.birthdate, 
        gender:r.data.gender 
      });
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
  }

  showConfirmDialog = (social_connection_id) => {
    return Alert.alert(
      "Are your sure?",
      "Are you sure you want to remove this connection?",
      [
        {
          text: "Yes",
          onPress: () => {
            this.delConnection(social_connection_id);
          },
        },
        {
          text: "No",
          onPress: () => {
            return;
          },
        },
      ]
    );
  };

  delConnection = async (social_connection_id) => {
    await apiClient.post('user/social-connections/'+social_connection_id+'/delete', 
    {},
    { 
      headers: {Authorization: 'Bearer ' + this.state.token}
    }).then(r => {
      if (r.data.status === 1) {
        console.log(r.data);
        this.getSocial();
      }
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
  }

  connectPage = async (social_connection_id) => {
    await apiClient.get('user/social-connections/'+social_connection_id+'/facebook-pages', 
    { 
      headers: {Authorization: 'Bearer ' + this.state.token}
    }).then(r => {
      if (r.data.status === 1) {
        this.getSocial();
      }
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
  }

  getSocial = async () => {
    await apiClient.get('user/socials', 
    { 
      headers: {Authorization: 'Bearer ' + this.state.token}
    }).then(r => {
      console.log(r.data.data.socials);
      this.setState({ 
        socials: r.data.data.socials,
      });
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
  }

  componentDidUpdate(prevProp, prevState) {
  }

  shouldComponentUpdate(nextProp, nextState) {
    return true;
  }

  componentDidMount() {
    this.getToken();
  }

  renderSocials = (item, index) => {
    const { navigation } = this.props;
    let socialite_name = item.socialite_name
    return (
      <Block
          style={{ width:'90%', marginVertical: 5, borderColor:argonTheme.COLORS.BORDER, borderWidth:1, borderRadius:10, padding:10 }}
          key={item._id}
        >
          {
            
            item.socialconnections &&
            item.socialconnections.map((item, idex) => 
              this.renderConnections(item, index, socialite_name)
            )
          }
          <LinearGradient 
            colors={['#66FCF1',  '#46BAB8']}
            style={{borderRadius: 30, marginVertical: 10}} 
            start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 0.8 }}>
                <Button
                  onPress={() =>
                    navigation.navigate('Connect',{social: item._id})
                  }
                  style={styles.button}
                  color='transparent'
                  padding='0 0 0 0'
                >
                  <Text size={16} style={{color: argonTheme.COLORS.WHITE, fontWeight: '600' }}>Create new {item.name} connection</Text>
              </Button> 
          </LinearGradient>
        </Block>
    );
  }

  renderConnections = (item, index, socialite_name) => {
    let page = false;
    if (socialite_name === 'facebook') {
      page = true;
    }
    return (
      <Text size={16} key={item._id}>{item.token.name} 
      {
        page && (
          <Icon
            onPress={() => this.connectPage(item._id)} 
            size={20} 
            name="file" 
            family="Feather" 
            style={{ margingLeft: 20 }} color={argonTheme.COLORS.ICON} />
        )
      } <Icon 
        onPress={() => this.showConfirmDialog(item._id)} 
        size={20} 
        name="x" 
        family="Feather" 
        style={{ margingLeft: 20 }} color={argonTheme.COLORS.ERROR} /></Text>
      
    );
  }

  render() {
    const {socials} = this.state;
    return (
      <Block flex>
          <Text bold size={16} style={styles.titleHead}>
            Available social connections
          </Text>
            <FlatList
              style={{marginVertical:5}}
              data={socials}
              renderItem={({item, index, separators}) => (
                <Block middle>
                  { this.renderSocials(item, index) }
                </Block>
              )}
              refreshing={false}
              onRefresh={() => this.getSocial()}
            />
      </Block>  
    );
  }
}

const styles = StyleSheet.create({
 
  titleHead: {
    paddingBottom: 0,
    paddingLeft: 22,
    marginTop: 22,
    color: argonTheme.COLORS.HEADER,
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1
  },
  profileBackground: {
    width: width,
    height: height / 2
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
    borderRadius: 30,
    borderWidth: 0,
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 0,
  },
  profileCard: {
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 20,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2
  },
  info: {
    paddingHorizontal: 40
  },
  avatarContainer: {
    position: "relative",
    marginTop: -80
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0
  },
  nameInfo: {
    marginTop: 20
  },
  divider: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#E9ECEF"
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure
  }
});

export default Profile;
