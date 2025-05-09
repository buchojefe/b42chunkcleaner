import { Button } from '@mui/material';

export const Support: React.FC = () => {
    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="coffee-left">
                <Button
                    style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 8, marginRight: '300px' }}
                    href="https://cafecito.app/buchojefe"
                >
                    <img alt="Comprame un cafecito" width="200" src="./assets/cafecito.png"></img>
                </Button>
                </div>
                <div className="coffee-right">
                <Button
                    style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 8 }}
                    href="https://ko-fi.com/K3K61EQ3BH"
                >
                    <img alt="Buy me a coffee" width="200" src="./assets/coffee.png"></img>
                </Button>
                </div>
            </div>
            <div className="spacer"></div>
        </>
    );
};
