import { View, Text, Pressable, FlatList, Image, StyleSheet, ScrollView } from "react-native";
import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import { Searchbar } from 'react-native-paper';
import debounce from 'lodash.debounce';
const db = SQLite.openDatabase('little_lemon');

export default function Home({ navigation }) {
    const categoryList = ['starters', 'mains', 'desserts', 'drinks', 'special']
    const [json, setJson] = useState([])
    const [data, setData] = useState([])
    const [selectedCateg, setSelectedCatg] = useState([])
    const [searchBarText, setSearchBarText] = useState('');
    const [query, setQuery] = useState('');

    const handleSelectCateg = (category) => {
        if (selectedCateg.includes(category)) {
            // Category already selected, remove it from the state
            setSelectedCatg(selectedCateg.filter(item => item !== category));
        } else {
            // Category not selected, add it to the state
            setSelectedCatg([...selectedCateg, category]);
        }
    }

    const lookup = useCallback((q) => {
        setQuery(q);
      }, []);
    
      const debouncedLookup = useMemo(() => debounce(lookup, 500), [lookup]);
    
      const handleSearchChange = (text) => {
        setSearchBarText(text);
        debouncedLookup(text);
      };

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'create table if not exists menuitems (id integer primary key not null, name text, price REAL, description text, image text, category text);'
            );

            tx.executeSql('select * from menuitems', [], (_, { rows }) => {
                if (rows._array.length === 0) {
                    // No items in table, fetch data
                    axios.get('https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json')
                        .then(response => {
                            const fetchedData = response.data.menu;
                            setJson(fetchedData)
                        })
                        .catch(err => {
                            console.log(err);
                        });

                    db.transaction((tx) => {
                        json.forEach((item) => {
                            tx.executeSql(
                                `insert into menuitems (name, price, description, image, category) values(?, ?, ?, ?, ?)`,
                                [item.name, item.price, item.description, item.image, item.category]
                            );
                        });
                    })
                } else {
                    // Items exist in table, use them
                    let items = rows._array.map((item) => ({
                        name: item.name,
                        price: item.price,
                        description: item.description,
                        image: item.image,
                        category: item.category,
                    }));
                    setData(items);
                }
            });
        });
    }, []);

    useEffect(() => {
        if (selectedCateg.length > 0) {
            db.transaction((tx) => {
                let placeholders = selectedCateg.map(() => '?').join(',');
                tx.executeSql(`SELECT * FROM menuitems WHERE category IN (${placeholders}) AND name LIKE ?`, [...selectedCateg, `%${query}%`], (_, { rows }) => {
                    let items = rows._array.map((item) => ({
                      name: item.name,
                      price: item.price,
                      description: item.description,
                      image: item.image,
                      category: item.category,
                    }));
                    setData(items);
                });
            });
        } else {
            db.transaction((tx) => {
                tx.executeSql(
                    `SELECT * FROM menuitems where name like ?`,
                    [`%${query}%`],
                    (_, { rows }) => {
                        let items = rows._array.map((item) => ({
                            name: item.name,
                            price: item.price,
                            description: item.description,
                            image: item.image,
                            category: item.category,
                        }));
                        setData(items);
                    },
                    (_, error) => {
                        console.log('SQL Error: ' + error.message);
                        return true; // stops further ontransaction statements from executing
                    }
                );
            })
        }
    }, [selectedCateg, query]);





    const Item = ({ item }) => (
        <View style={styles.menuItemContainer}>
            <View style={styles.menuTextContainer}>
                <Text style={styles.menuHeader}>{item.name}</Text>
                <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.menuPrice}>${item.price}</Text>
            </View>
            <View style={styles.menuImgContainer}>
                <Image style={styles.menuImg} source={{ uri: `https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/${item.image}?raw=true` }} />
            </View>
        </View>
    )

    return (
        <View style={styles.container}>
            <View style={styles.bannerContainer}>
                <Text style={styles.bannerHeader}>Little Lemon</Text>
                <View style={styles.bannerBodyContainer}>
                    <View style={styles.bannerTextContainer}>
                        <Text style={styles.bannerSubHeader}>Chicago</Text>
                        <Text style={styles.bannerText}>We are a family owned Mediterranean restaurant, focused on traditional recipes served with a morden twist</Text>
                    </View>
                    <Image style={styles.bannerImg} source={require('../assets/Heroimage.png')} />
                </View>
                <Searchbar
                    onChangeText={handleSearchChange}
                    value={searchBarText}
                    style={styles.searchBar}
                    iconColor="black"
                    inputStyle={{ color: 'black' }}
                    contentContainerStyle={{ justifyContent: 'center' }} // Add this line
                    elevation={2}
                    fontSize={18}
                />
            </View>
            <View style={styles.categorySectContainer}>
                <Text style={styles.categorySectText}>ORDER FOR DELIVERY!</Text>
                <ScrollView style={styles.categoryContainer} horizontal={true}>
                    {categoryList.map((category) => {
                        return (
                            <Pressable
                                style={[styles.categoryButton, selectedCateg.includes(category) ? styles.categoryButtonSelected : null]}
                                onPress={() => handleSelectCateg(category)}
                                keyExtractor={(item, index) => `${item.name}-${index}`}
                            >
                                <Text style={styles.categoryButtonText}>{category}</Text>
                            </Pressable>
                        );
                    })}

                </ScrollView>
            </View>
            <View style={styles.menuContainer}>
                <FlatList
                    data={data}
                    renderItem={({ item }) => <Item item={item} />}
                    keyExtractor={(item, index) => item.name + index}

                />
            </View>
        </View>
    )
}

styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: 'white',
        flexDirection:'column',
        justifyContent:'space-between'
    },
    bannerContainer: {
        backgroundColor: '#495E57',
        padding: 10

    },
    bannerBodyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'

    },
    bannerTextContainer: {
        flexDirection: 'column',
        width: 220,
        height: 120,
        justifyContent: 'space-between'

    },
    bannerHeader: {
        fontSize: 40,
        color: '#F4CE14'

    },
    bannerSubHeader: {
        fontSize: 25,
        color: '#EDEFEE'

    },
    bannerText: {
        color: '#EDEFEE'

    },
    bannerImg: {
        width: 120,
        height: 120,
        borderRadius: 10

    },
    searchBar: {
        marginVertical: 10,
        backgroundColor: '#EDEFEE',
        shadowRadius: 0,
        shadowOpacity: 0,
    },
    categorySectContainer: {
        paddingTop: 20,
        paddingHorizontal: 20,

    },
    categorySectText: {
        fontSize: 15,
        fontWeight: 800

    },
    categoryContainer: {
        paddingBottom: 20,
        paddingTop: 10,
        borderBottomWidth: 1
    },
    categoryButton: {
        padding: 10,
        backgroundColor: '#EDEFEE',
        marginRight: 8,
        borderRadius: 20
    },
    categoryButtonSelected: {
        padding: 10,
        backgroundColor: '#FBDABB',
        marginRight: 8,
        borderRadius: 20
    },
    categoryButtonText: {
        fontWeight: 'bold'
    },
    menuContainer: {
        marginHorizontal: 10,
        height:330
    },
    menuItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'gray'
    },
    menuTextContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: 240,
        height: 100,
    },
    menuImgContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    menuImg: {
        width: 70,
        height: 70,
        resizeMode: 'cover'
    },
    menuHeader: {
        fontSize: 18,
        fontWeight: 600
    },
    menuDesc: {
        fontSize: 15,
        color: '#495E57'
    },
    menuPrice: {
        fontSize: 18,
        color: '#495E57',
        fontWeight: 500
    }
})