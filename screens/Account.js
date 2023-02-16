import React from "react";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
  ScrollView,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
  FlatList,
  Platform,
} from "react-native";
import { format } from "date-fns";
import {BACKEND_PATH} from "@env"
import { Block, Checkbox, Button, Text, theme } from "galio-framework";
import { Input, Icon,  DrawerItem as DrawerCustomItem } from "../components";
import { LinearGradient } from 'expo-linear-gradient';
const { height, width } = Dimensions.get("screen");
import prefs from "../constants/preferences"
import argonTheme from "../constants/Theme";
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {numberFormat, apiClient} from '../constants/utils'
const thumbMeasure = (width - 48 - 32) / 3;
const cardWidth = width - theme.SIZES.BASE * 2;


class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token:null,
      objuser:null,
      email: '',
      erroremail:false,
      password: '',
      errorpass:false,
      name:'',
      birthdate:null,
      gender:null,
      errorname:false,
      repassword: '',
      errorrepass:false,
      termsAccepted: false,
      isLoading: false,
      isLogged: false,
      tabScreen:'wallet',
      categories:[],
      prefcategories:[],
      appstyles:[],
      prefstyles:[],
      modalVisible:false,
      recipt:'',
      payout:null,
      errorpayout:false,
      datePickerVisible:false,
    };
  }

  async getToken() {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t})
        this.getUser()
    });
  }

  getPlaceHolder(witch, statusfielderror, message) {
    if (!statusfielderror) {
      return witch;
    } else {
      return witch + " " + message;
    }
  }

  async updateuser(name) {
    var status = true;
    if (name === '') {
      this.setState({errorname: true});
      status = false;
    } else {
      this.setState({errorname: false});
    }
    if (!status) {
      return
    }
    this.setState({isLoading: true});
    await apiClient.post('/user/update', 
    { 
      name,
      birthdate:this.state.birthdate,
      gender:this.state.gender
    },
    { headers: {Authorization: 'Bearer ' + this.state.token}})
    .then(r => {
      console.log(r.data);
    })
    .catch(e => { 
      console.log(e);
      this.setState({isLoading: false});
    })
    .finally(()=>{
      this.setState({isLoading: false});
    })
  }

  checkBoxCategories(val) {
    console.log('categories');
    if (this.state.prefcategories.includes(val)){
      this.state.prefcategories.splice(this.state.prefcategories.indexOf(val), 1);
    } else {
      this.state.prefcategories.push(val);
    }
    console.log(this.state.prefcategories);
    this.postCategories();
  }

  checkBoxStyles(val) {
    console.log('styles');
    if (this.state.prefstyles.includes(val)){
      this.state.prefstyles.splice(this.state.prefstyles.indexOf(val), 1);
    } else {
      this.state.prefstyles.push(val);
    }
    console.log(this.state.prefstyles);
    this.postStyles();
  }

  async postCategories() {
      apiClient.post('categories', 
      { categories: this.state.prefcategories },
      { headers: {Authorization: 'Bearer ' + this.state.token}}).then(r => {
        this.setState({ prefcategories: r.data.categories });
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{})
  }

  async postStyles() {
      apiClient.post('styles', 
      { styles: this.state.prefstyles },
      { headers: {Authorization: 'Bearer ' + this.state.token}}).then(r => {
        this.setState({ prefstyles: r.data.styles });
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{})
  }

  setPayout(apayout) {
    this.setState({ payout:apayout });
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
        gender:r.data.gender,
        objuser:r.data
      });
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
  }

  async getCategories() {
    try {
      const response = await fetch(BACKEND_PATH+'categories');
      const json = await response.json();
      this.setState({ categories: json });
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async getStyles() {
    try {
      const response = await fetch(BACKEND_PATH+'styles');
      const json = await response.json();
      this.setState({ appstyles: json });
      console.log(this.state.appstyles);
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  goPayout = async (value) => {
    await apiClient.post('user/payout', 
    { value:value*-1,
      recipt:'payout'
    },
    { headers: {Authorization: 'Bearer ' + this.state.token}}).then(r => {
      console.log(r.data);
      this.setState({ 
        objuser:r.data.user,
        payout:null
      });
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
  }

  showModal = (text) => {
    this.setState({recipt:text});
    this.setState({modalVisible:true})
  }

  componentDidUpdate(prevProp, prevState) {
  }

  shouldComponentUpdate(nextProp, nextState) {
    return true;
  }

  componentDidMount() {
    this.getCategories();
    this.getStyles();
    this.getToken();
  }

  renderSubCheckBoxCategories = (item, index) => {
    const { prefcategories } = this.state;
    return (
      <Block style={{marginVertical:5,marginHorizontal:30}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxCategories(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={prefcategories.includes(item.id)}
            label={item.name}
        />
      </Block>
    )
  }

  renderCheckBoxCategories = (item, index) => {
    const { prefcategories } = this.state;
    return (
      <Block style={{margin:10}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxCategories(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={prefcategories.includes(item.id)}
            label={item.name}
        />
        {
          item.children && 
          item.children.map(
            (item, index) =>
              this.renderSubCheckBoxCategories(item, index)
            )
        }
      </Block>
    )
  }

  renderSubCheckBoxStyles = (item, index) => {
    const { prefstyles } = this.state;
    return (
      <Block style={{marginVertical:5,marginHorizontal:30}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxStyles(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={prefstyles.includes(item.id)}
            label={item.name}
        />
      </Block>
    )
  }

  renderCheckBoxStyles = (item, index) => {
    const { prefstyles } = this.state;
    return (
      <Block style={{margin:10}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxStyles(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={prefstyles.includes(item.id)}
            label={item.name}
        />
        {
          item.children && 
          item.children.map(
            (item, index) =>
              this.renderSubCheckBoxStyles(item, index)
            )
        }
      </Block>
    )
  }

  renderPreferences = () => {
    const { categories } = this.state;
    return (
      <Block flex style={styles.container}>
        <Block flex center style={{margin:20}}>
        <Text>Categories</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}>
            <Block flex>
              {categories.length > 0  &&
                categories.map((item, index) =>
                  this.renderCheckBoxCategories(item, index)
                )
              }
            </Block>
          </ScrollView>
        </Block>
      </Block>
    )
  }

  renderStyles = () => {
    const { appstyles } = this.state;
    return (
      <Block flex style={styles.container}>
        <Block flex center style={{margin:20}}>
          <Text>Styles</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}>
            <Block flex>
              {appstyles.length > 0  &&
                appstyles.map((item, index) =>
                  this.renderCheckBoxStyles(item, index)
                )
              }
            </Block>
          </ScrollView>
        </Block>
      </Block>
    )
  }

  renderPersonal = () => {
    const { isLoading, isLogged, datePickerVisible } = this.state;
    const showDatePicker = () => {
      this.setState({datePickerVisible:true})
    };
  
    const hideDatePicker = () => {
      this.setState({datePickerVisible:false})
    };
  
    const handleConfirm = (date) => {
      this.setState({birthdate: date});
      hideDatePicker();
    };
    return (
      <Block flex style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          enabled
        >
          <Block flex space="between" style={styles.padded}>
            <Block flex space="around" style={{ zIndex: 2 }}>
                <Block flex style={styles.title}>
                    <Block  style={{marginBottom: 10}}>
                      <Input
                        label='Name'
                        value={this.state.name}
                        onChange={(e) => this.setState({ name: e.nativeEvent.text })}
                        error={this.state.errorname}
                        borderless={!this.state.errorname}
                        placeholder={this.getPlaceHolder('Name',this.state.errorname, 'required')}
                      />
                    </Block>
                    <Block style={{marginBottom: 20}}>
                      <SegmentedControl
                        values={['Female', 'Male', 'n/a']}
                        selectedIndex={this.state.gender}
                        onChange={(event) => {
                            this.setState({gender: event.nativeEvent.selectedSegmentIndex});
                        }}
                      />
                    </Block>
                    <Block style={{marginBottom: 20}}>
                    {Platform.OS === 'android' && (
                      <Block row>
                          <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 2 }}>
                           Birthday
                          </Text>
                        <Text style={{ fontSize: 16, marginTop: 2, marginLeft:20 }}>
                        {this.state.birthdate ? format(new Date(this.state.birthdate),'dd/MM/yyyy') : 'No date selected'}
                        </Text>
                        <Icon 
                          name={"calendar"} family="entypo" 
                          size={26} onPress={showDatePicker} 
                          color={argonTheme.COLORS.PRIMARY}
                          style={{ marginHorizontal: 10 }}></Icon>
                          <DateTimePickerModal
                                
                                date={this.state.birthdate ? new Date(this.state.birthdate) : new Date()}
                                isVisible={datePickerVisible}
                                mode="date"
                                datePickerContainerStyleIOS={{width: 320, backgroundColor: "white"}}
                                onConfirm={handleConfirm}
                                onCancel={hideDatePicker}
                          />
                      </Block>
                    )}
                    {Platform.OS === 'ios' && (
                      <Block row>
                        <Text size={14} style={{fontWeight:'500',marginVertical:12, marginLeft:16}}>Birth day</Text>
                        <DateTimePicker
                              value={this.state.birthdate ? new Date(this.state.birthdate) : new Date()}
                              display="default"
                              style={styles.windowsPicker}
                              onChange={(e) => this.setState({birthdate: new Date(e.nativeEvent.timestamp)})}
                              placeholderText="select date"
                          />
                      </Block>
                    )}
                    
                    </Block>
                    <Block center>
                    {isLoading  ? <ActivityIndicator/> : (
                      <LinearGradient colors={['#66FCF1',  '#46BAB8']}
                        style={{borderRadius: 30}} 
                        start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.1 }}>
                        <Button
                          style={styles.button}
                          color='transparent'
                          padding='0 0 0 0'
                          onPress={() => this.updateuser(this.state.name)}
                          textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                        >
                          UPDATE
                        </Button>
                      </LinearGradient>
                    )}
                    </Block>
                </Block>
              </Block>
          </Block>
        </KeyboardAvoidingView>
      </Block>
    );
  }

  renderWallet = () => {
    const { isLoading, isLogged, objuser, modalVisible, recipt } = this.state;
    const FlatList_Header = () => {
      return (
        <Block row flex style={[styles.listHeader, styles.card]}>
          <Block flex style={[styles.listHeader,styles.card]}>
            <Text>Date</Text>
          </Block>
          <Block flex style={[styles.listHeader,styles.card]}>
          <Text bold>Amount</Text>
          </Block>
        </Block>
      );
    }
    const Empty_List = () => {
      return (
        <Block row flex style={[styles.listHeader, styles.card]}>
          <Text size={12} color={argonTheme.COLORS.MUTED}>No data, to refresh data please swipe down the list</Text>
        </Block>
      );
    }
  
    return (
      
      <Block flex style={styles.container}>
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
              this.setState({modalVisible:!modalVisible});
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>{recipt}</Text>
                <Pressable
                  style={[styles.buttonClose]}
                  onPress={() => this.setState({modalVisible:!modalVisible})}>
                  <Text style={styles.textStyle}>Close</Text>
                </Pressable>
              </View>
            </View>
        </Modal>
        
          <Block flex space="between" style={styles.padded}>
            <Block flex space="around" style={{ zIndex: 2 }}>
                <Block flex style={styles.title}>
                  {objuser && (
                    <Block flex style={{marginBottom: 10}}>
                      <Block row >
                        <Icon 
                          name={"refresh"} 
                          family="FontAwesome" 
                          size={30} onPress={() => this.getUser()} 
                          color={ argonTheme.COLORS.PRIMARY}
                          style={{ margin: 1 }} />
                          <Text size={20} bold>Wallet balance: {numberFormat(objuser.wallet_balance)}</Text>
                      </Block>
                      <Text center 
                        size={14} style={styles.title} bold >
                        Wallet operation
                      </Text>
                      <FlatList
                        style={{marginVertical:10}}
                        data={objuser.wallet_operations}
                        renderItem={({item, index, separators}) => (
                          <Block row flex style={[styles.card]}>
                            <Block flex={3}>
                              <Text>{format(Date.parse(item.created_at),'dd/MM/yyyy HH:mm')}</Text>
                            </Block>
                            <Block flex={2}>
                              <Text bold color={argonTheme.COLORS[parseInt(item.value) < 0 ? 'ERROR' : 'BLACK']}>{numberFormat(item.value)}</Text>
                            </Block>
                            <Block flex style={{paddingBottom:4, borderWidth:0}}>
                              <Icon name={"info"} family="Feather" 
                                    size={26} onPress={()=>this.showModal(item.recipt)} 
                                    color={argonTheme.COLORS.PRIMARY}
                                    
                                    ></Icon>
                            </Block>
                          </Block>
                        )}
                        ListHeaderComponent={FlatList_Header}
                        ListEmptyComponent={Empty_List}
                        refreshing={false}
                        onRefresh={() => this.getUser()}
                      />
                      <Block row center style={[styles.padded]}>
                          <Input
                              family='Foundation'
                              icon='dollar'
                              iconSize={30}
                              type='number-pad'
                              value={this.state.payout}
                              onChange={(e) => this.setPayout(e.nativeEvent.text)}
                              error={this.state.errorpayout}
                              borderless={!this.state.errorpayout}
                              placeholder={'amount'}
                          />
                          {isLoading  ? <ActivityIndicator/> : (
                            <LinearGradient colors={['#66FCF1',  '#46BAB8']}
                              style={{borderTopRightRadius: 30, borderBottomRightRadius:30}} 
                              start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.1 }}>
                              <Button
                                style={styles.buttonSmall}
                                color='transparent'
                                padding='0 0 0 0'
                                onPress={() => this.goPayout(this.state.payout)}
                                textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                              >
                                PAYOUT
                              </Button>
                            </LinearGradient>
                          )}
                      </Block>
                    </Block>
                  )}
                </Block>
            </Block>
          </Block>
      </Block>
    );
  }

  renderAudience = () => {
    const { isLoading, isLogged, objuser, modalVisible, recipt } = this.state;
    const FlatList_Header = () => {
      return (
        <Block row flex style={[styles.listHeader, styles.card]}>
          <Block flex style={[styles.listHeader,styles.card]}>
            <Text>Date</Text>
          </Block>
          <Block flex style={[styles.listHeader,styles.card]}>
          <Text bold>Amount</Text>
          </Block>
        </Block>
      );
    }
    const Empty_List = () => {
      return (
        <Block row flex style={[styles.listHeader, styles.card]}>
          <Text size={12} color={argonTheme.COLORS.MUTED}>No data, to refresh data please swipe down the list</Text>
        </Block>
      );
    }
    const autocompleteStyle = {
      container: {
        width: "100%",
        flex: null,
        marginTop: 20,
        zIndex:1
      },
      
      listView: {
        borderColor: "#c8c7cc",
        borderWidth: 1,
        borderRadius: 2,
        position: "absolute",
        width: parseInt(cardWidth),
        left: parseInt(0),
        top: 47,
      },
      textInput: {
        borderRadius: 4,
        borderColor: argonTheme.COLORS.BORDER,
        height: 44,
        backgroundColor: '#F7FAFC'
      },
      row: {
        backgroundColor: "blue",
      },
      predefinedPlacesDescription: {
        color: "black",
      },
      loader: { color: "red" },
      };
    return (
      <Block flex style={styles.container}>
          <Block flex space="between" style={styles.padded}>
          
            <Block flex space="around" style={{ zIndex: 2 }}>
                
                <Block flex style={styles.title}>
            
                    <GooglePlacesAutocomplete
                        placeholder='Search Region or City'
                        minLength={2}
                        onPress={(data, details = null) => {
                            console.log(data.place_id);
                        }}
                        listViewDisplayed={false}
                        query={{
                            key: 'AIzaSyAhHobUGwgbSB6C8uUCNm-FldqOV8QI20Y',
                            language: 'en',
                            type:'(regions)',
                            
                        }}
                        styles={{
                          textInput: {
                            borderRadius: 4,
                            borderColor: argonTheme.COLORS.BORDER,
                            height: 44,
                            backgroundColor: '#F7FAFC'
                          },
                          predefinedPlacesDescription: {
                            color: '#1faadb',
                          },
                        }}
                    />
                  
                </Block>
            </Block>
          </Block>
      </Block>
    );
  }

  render() {
    const { navigation } = this.props;
    var screen = 'wallet';
    try {
        screen = this.props.route.params.tabId;
    } catch(error) {
        console.log(error);
    };
    switch (screen) {
      case 'wallet':
        return this.renderWallet();
        break;
      case 'personal':
        return this.renderPersonal();
        break;
      case 'preferences':
        return this.renderPreferences();
        break;
      case 'styles':
        return this.renderStyles();
        break;
      case 'audience':
        return this.renderAudience();
        break;
      default:
        return this.renderPersonal();
        break;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.WHITE
  },
  listHeader: {
    backgroundColor: argonTheme.COLORS.BORDER
  },
  padded: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    position: "relative",
    bottom: theme.SIZES.BASE,
    zIndex: 2,
  },
  title: {
    marginTop:'10%'
  },
  subCheckbox: {
    paddingLeft: 20
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
    borderRadius: 30,
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 0,
  },
  buttonSmall: {

    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
    borderTopRightRadius: 30, 
    borderBottomRightRadius:30,
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 0,
  },
  logo: {
    width: 79,
    height: 41,
    zIndex: 2,
    position: 'relative',
    marginTop: '30%'
  },
  windowsPicker: {
    flex:1,
    width:200,
    paddingTop: 10,
    height:44,
   
  },
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: 2,
    padding:2,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width-50,
  },
  
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: argonTheme.COLORS.PRIMARY,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default Account;
