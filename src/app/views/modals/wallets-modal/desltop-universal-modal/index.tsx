import { Component, createMemo, createSignal, For } from 'solid-js';
import {
    H2Styled,
    QRCodeStyled,
    H2AvailableWalletsStyled,
    WalletsContainerStyled,
    DesktopUniversalModalStyled
} from './style';
import { ConnectAdditionalRequest, isWalletInfoRemote, WalletInfo } from '@tonconnect/sdk';
import { appState } from 'src/app/state/app.state';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { FourWalletsItem, H1, WalletItem, WalletLabeledItem } from 'src/app/components';
import { PersonalizedWalletInfo } from 'src/app/models/personalized-wallet-info';
import { IMG } from 'src/app/env/IMG';

import { addReturnStrategy, redirectToTelegramDeWallet } from 'src/app/utils/url-strategy-helpers';

interface DesktopUniversalModalProps {
    additionalRequest: ConnectAdditionalRequest;

    walletsList: PersonalizedWalletInfo[];

    onSelect: (walletInfo: WalletInfo) => void;

    onSelectAllWallets: () => void;
}

export const DesktopUniversalModal: Component<DesktopUniversalModalProps> = props => {
    const [popupOpened, setPopupOpened] = createSignal(false);
    const connector = appState.connector;


    const onSelectTelegram = (): void => {

        const walletLink = connector.connect(
            {
                bridgeUrl: 'https://bridge.tonapi.io/bridge',
                universalLink: 'https://t.me/delabtonbot/wallet?attach=wallet' // https://t.me/wallet?attach=wallet
            },
            props.additionalRequest
        );

        console.log('CONNECTOR walletLink', walletLink)

        // const forceRedirect = !firstClick();
        // setFirstClick(false);

        redirectToTelegramDeWallet(walletLink, {
            returnStrategy: appState.returnStrategy,
            twaReturnUrl: appState.twaReturnUrl,
            forceRedirect: true
        });

    };

    const walletsBridges = () => [...new Set(props.walletsList
        .filter(isWalletInfoRemote)
        .map(item => item.bridgeUrl ))
        .values()]
        .map(bridgeUrl => ({ bridgeUrl }));

    setLastSelectedWalletInfo({ openMethod: 'qrcode' });
    const request = createMemo(() => connector.connect(walletsBridges(), props.additionalRequest));

    return (
        <DesktopUniversalModalStyled
            onClick={() => setPopupOpened(false)}
            data-tc-wallets-modal-universal-desktop="true"
        >
            <H1 translationKey="walletModal.desktopUniversalModal.connectYourWallet">
                Connect your wallet
            </H1>
            <H2Styled translationKey="walletModal.desktopUniversalModal.scan">
                Scan with your mobile wallet
            </H2Styled>
            <QRCodeStyled
                sourceUrl={addReturnStrategy(request()!, 'none')}
                disableCopy={popupOpened()}
                imageUrl={IMG.TON}
            />
            <H2AvailableWalletsStyled translationKey="walletModal.desktopUniversalModal.availableWallets">
                Available wallets
            </H2AvailableWalletsStyled>
            <WalletsContainerStyled>
                        <li>
                        <WalletItem
                                    icon={"https://avatars.githubusercontent.com/u/116884789?s=200&v=4"}
                                    name={"DeWallet"}
                                    onClick={onSelectTelegram}
                                />
                        </li>
                <For each={props.walletsList.slice(1, 3)}>
                    {wallet => (
                        <li>
                          { wallet.name !== 'DeWallet' && <WalletLabeledItem
                                wallet={wallet}
                                onClick={() => props.onSelect(wallet)}
                            />}
                        </li>
                    )}
                </For>
                <FourWalletsItem
                    labelLine1="View all"
                    labelLine2="wallets"
                    images={props.walletsList.slice(3, 7).map(i => i.imageUrl)}
                    onClick={() => props.onSelectAllWallets()}
                />
            </WalletsContainerStyled>
        </DesktopUniversalModalStyled>
    );
};
