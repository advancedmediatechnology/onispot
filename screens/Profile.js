import React from "react";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
  Platform
} from "react-native";
import { Block, Text, theme, Button } from "galio-framework";



import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

const apiClient = axios.create({
  baseURL: 'http://test.onispot.com/api/' ,
  withCredentials: true,
});

class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      token:null,
      socials:null,
      socialurl:null,
    };
  }

  async getToken() {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t})
        this.getUser()
    });
  }

  async getUser() {
    apiClient.post('user', 
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

  async getSocial() {
    apiClient.get('socials', 
    { },
    { }).then(r => {
      console.log(r.data.data.socials);
      this.setState({ 
        socials: r.data.data.socials,
      });
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
  }

  async getSociaUrl(id) {
    apiClient.get('socials/'+id+'/connect', 
    { },
    { }).then(r => {
      console.log(r.data.url);
      this.setState({socialurl: r.data.url});
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
    this.getSocial()
  }

  render() {
    const {socials} = this.state;
    const {socialurl} = this.state;
    const { navigation } = this.props;
    return (
    
      <Block flex style={styles.profile}>
        <Block flex>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width, }}
            >
              <Block flex style={styles.profileCard}>
               
                
                <Block flex>
                  <Block middle style={styles.nameInfo}>
                  {socials &&
                    socials.map((item, index) => (
                      <Block
                        style={{ marginVertical: 5, marginHorizontal: 30 }}
                        key={item._id}
                      >
                        <Button
                          onPress={() =>
                            navigation.navigate('Connect',{social: item._id})
                          }
                          color={argonTheme.COLORS.PRIMARY}
                        />
                        <Text>{item.name}</Text>
                      </Block>
                    ))}
                  </Block>
                  <Block middle style={{ marginTop: 30, marginBottom: 16 }}>
                    <Block style={styles.divider} />
                  </Block>
                </Block>
              </Block>
            </ScrollView>
        </Block>
      </Block>  
    );
  }
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1,
    backgroundColor: argonTheme.COLORS.WHITE
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
    marginTop: 35
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
