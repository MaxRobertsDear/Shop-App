import React, {
  useLayoutEffect,
  useCallback,
  useReducer,
  useState,
  useEffect,
} from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Button,
  Image,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native'
import { useSelector, useDispatch, RootStateOrAny } from 'react-redux'
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'

import CustomHeaderButton from '../../components/UI/CustomHeaderButton'
import * as productActions from '../../store/actions/products'
import Input from '../../components/UI/Input'
import Colors from '../../constants/Colors'
import { RootState } from '../ProductsRootState.d'
import { Props } from './EditProductScreen.d'

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE'

const formReducer = (
  state: RootStateOrAny,
  action: { type: string, input: string, value: string, isValid: boolean },
) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value,
    }
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid,
    }
    let updatedFormIsValid = true
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key]
    }
    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues,
    }
  }
  return state
}

const EditProductScreen = ({ navigation, route }: Props) => {
  const dispatch = useDispatch()
  const prodId = route.params && route.params.productId
  const editedProduct = useSelector((state: RootState) =>
    state.products.userProducts.find((prod) => prod.id === prodId),
  )
  const [error, setError] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState()

  useEffect(() => {
    getPermissionAsync()
  }, [])

  useEffect(() => {
    if (editedProduct && formState.inputValues.imageUrl) {
      setImageUrl(formState.inputValues.imageUrl)
    }
  }, [])

  const getPermissionAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!')
    }
  }

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      title: editedProduct ? editedProduct.title : '',
      imageUrl: editedProduct ? editedProduct.imageUrl : '',
      description: editedProduct ? editedProduct.description : '',
      price: '',
    },
    inputValidities: {
      title: editedProduct ? true : false,
      imageUrl: editedProduct ? true : false,
      description: editedProduct ? true : false,
      price: editedProduct ? true : false,
    },
    formIsValid: editedProduct ? true : false,
  })

  const submitHandler = useCallback(async () => {
    if (!formState.formIsValid) {
      Alert.alert('Wrong input', 'Please check the errors on the screen', [
        { text: 'Okay' },
      ])
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      if (editedProduct) {
        await dispatch(
          productActions.updateProduct(
            prodId,
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imageUrl,
          ),
        )
      } else {
        await dispatch(
          productActions.createProduct(
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imageUrl,
            // @ts-ignore
            +formState.inputValues.price,
          ),
        )
      }
    } catch (err) {
      setError(err.message)
    }
    setIsLoading(false)
    navigation.goBack()
  }, [dispatch, formState, prodId, editedProduct, navigation])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params && route.params.productId ? 'Edit Item' : 'Add Item',
    })
  }, [navigation, prodId, formState.inputValues.title, route.params])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <CustomHeaderButton iconName='md-save' onPress={submitHandler} />
      ),
    })
  }, [submitHandler, navigation])

  const textChangeHandler = (inputIdentifier: string, text: string) => {
    let isValid = false
    if (text.trim().length > 0) {
      isValid = true
    }
    dispatchFormState({
      type: FORM_INPUT_UPDATE,
      value: text,
      isValid: isValid,
      input: inputIdentifier,
    })
  }

  const deleteHandler = (id: string) => {
    Alert.alert('Are you sure?', 'Do you really want to delte this item?', [
      { text: 'No', style: 'default' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          dispatch(productActions.deleteProduct(id))
          navigation.navigate('UserProductsScreen')
        },
      },
    ])
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      })
      if (!result.cancelled) {
        setImageUrl(result.uri)
        textChangeHandler('imageUrl', result.uri)
      }
    } catch (E) {
      console.log(E)
    }
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>An error occurred.</Text>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color={Colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView>
      <View style={styles.form}>
        <Input
          label='Title'
          errorText={formState.inputValidities.title}
          autoCapitalize='sentences'
          autoCorrect
          returnKeyType='next'
          value={formState.inputValues.title}
          onChangeText={(input: string) => textChangeHandler('title', input)}
          maxLength={18}
        />
        {/* 
        <Input
          label='Image Url'
          errorText={formState.inputValidities.imageUrl}
          returnKeyType='next'
          value={formState.inputValues.imageUrl}
          onChangeText={(input) => textChangeHandler('imageUrl', input)}
        /> */}

        {editedProduct ? null : (
          <Input
            label='Price'
            errorText={formState.inputValidities.price}
            keyboardType='decimal-pad'
            returnKeyType='next'
            value={formState.inputValues.price}
            onChangeText={(input: string) => textChangeHandler('price', input)}
          />
        )}
        <Input
          label='Description'
          errorText={formState.inputValidities.description}
          autoCapitalize='sentences'
          autoCorrect
          multiline
          value={formState.inputValues.description}
          onChangeText={(input: string) =>
            textChangeHandler('description', input)
          }
        />
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Button title='Pick an image from camera roll' onPress={pickImage} />
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 200, height: 200 }}
            />
          )}
        </View>
        <Button
          color={Colors.primary}
          title='Delete'
          onPress={() => deleteHandler(route.params.productId)}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  form: {
    margin: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default EditProductScreen
