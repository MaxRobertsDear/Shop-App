import React, { useLayoutEffect } from 'react'
import { FlatList, View, Text } from 'react-native'
import { useSelector } from 'react-redux'

import { numberOfItemColumns } from '../../constants/Constants'
import CustomHeaderButton from '../../components/UI/CustomHeaderButton'
import ProductItem from '../../components/shop/ProductItem'
import { RootState } from '../ProductsRootState.d'
import { Props } from './UserProductsScreen.d'

const UserProductsScreen = ({ navigation }: Props) => {
  const userProducts = useSelector(
    (state: RootState) => state.products.userProducts,
  )
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <CustomHeaderButton
          iconName='md-menu'
          onPress={() => {
            navigation.openDrawer()
          }}
        />
      ),
    })
  }, [navigation])
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <CustomHeaderButton
          iconName='md-add'
          onPress={() => {
            navigation.navigate('EditProductsScreen', { productId: '' }) // productId is generated by firebase when creating new product
          }}
        />
      ),
    })
  }, [navigation])

  const editProductHandler = (id: string) => {
    navigation.navigate('EditProductsScreen', { productId: id })
  }

  if (!userProducts.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No products found. Maybe you should create some</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={userProducts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        alignItems: 'center',
        backgroundColor: 'white',
      }}
      initialNumToRender={6}
      numColumns={numberOfItemColumns}
      renderItem={(itemData) => (
        <ProductItem
          title={itemData.item.title}
          price={itemData.item.price}
          image={itemData.item.imageUrl}
          onClick={() => {
            editProductHandler(itemData.item.id)
          }}
        />
      )}
    />
  )
}

export default UserProductsScreen
