import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/themeContext';




export default function WalletScreen() {
    const { theme } = useContext(ThemeContext);

    return (
        <View style={[ styles.container, { backgroundColor: theme.background }]}>
        <ThemedView style={styles.titleContainer}>
            <ThemedText
                type="titleBig"
                style={{
                    fontFamily: Fonts.rounded,
                }}>
                Explore
            </ThemedText>
        </ThemedView><ThemedText>This app includes example code to help you get started.</ThemedText><Collapsible title="File-based routing">
                <ThemedText>
                    This app has two screens:{' '}
                    <ThemedText type="default">app/(tabs)/index.tsx</ThemedText> and{' '}
                    <ThemedText type="default">app/(tabs)/explore.tsx</ThemedText>
                </ThemedText>
                <ThemedText>
                    The layout file in <ThemedText type="default">app/(tabs)/_layout.tsx</ThemedText>{' '}
                    sets up the tab navigator.
                </ThemedText>
                <ExternalLink href="https://docs.expo.dev/router/introduction">
                    <ThemedText type="default">Learn more</ThemedText>
                </ExternalLink>
            </Collapsible><Collapsible title="Android, iOS, and web support">
                <ThemedText>
                    You can open this project on Android, iOS, and the web. To open the web version, press{' '}
                    <ThemedText type="default">w</ThemedText> in the terminal running this project.
                </ThemedText>
            </Collapsible><Collapsible title="Images">
                <ThemedText>
                    For static images, you can use the <ThemedText type="default">@2x</ThemedText> and{' '}
                    <ThemedText type="default">@3x</ThemedText> suffixes to provide files for
                    different screen densities
                </ThemedText>
                <Image
                    source={require('@/assets/images/react-logo.png')}
                    style={{ width: 100, height: 100, alignSelf: 'center' }} />
                <ExternalLink href="https://reactnative.dev/docs/images">
                    <ThemedText type="default">Learn more</ThemedText>
                </ExternalLink>
            </Collapsible><Collapsible title="Light and dark mode components">
                <ThemedText>
                    This template has light and dark mode support. The{' '}
                    <ThemedText type="default">useColorScheme()</ThemedText> hook lets you inspect
                    what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
                </ThemedText>
                <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
                    <ThemedText type="default">Learn more</ThemedText>
                </ExternalLink>
            </Collapsible><Collapsible title="Animations">
                <ThemedText>
                    This template includes an example of an animated component. The{' '}
                    <ThemedText type="default">components/HelloWave.tsx</ThemedText> component uses
                    the powerful{' '}
                    <ThemedText type="default" style={{ fontFamily: Fonts.mono }}>
                        react-native-reanimated
                    </ThemedText>{' '}
                    library to create a waving hand animation.
                </ThemedText>
                {Platform.select({
                    ios: (
                        <ThemedText>
                            The <ThemedText type="default">components/ParallaxScrollView.tsx</ThemedText>{' '}
                            component provides a parallax effect for the header image.
                        </ThemedText>
                    ),
                })}
            </Collapsible>
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  profileLink: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 50,
    position: 'absolute', 
    top: '8%', 
    left: '8%',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
