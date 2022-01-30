import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzM5MzQzOSwiZXhwIjoxOTU4OTY5NDM5fQ.xRuEwWWVQvdEVDrRUhcdBFF-uNPKjgSS2VL0EMJDe10'
const SUPABASE_URL = 'https://uwiwjsgkfqcogncihjop.supabase.co'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
      .from('mensagens')
      .on('INSERT', (respostaLive) => {
        adicionaMensagem(respostaLive.new);
      })
      .subscribe();
  }

export default function ChatPage() {

    const roteamento = useRouter()
    const usuarioLogado = roteamento.query.username
    const [mensagem, setMessagem] = React.useState('')
    const [listaMensagem, setListaMensagem] = React.useState([])

    React.useEffect(() => {
            supabaseClient.from('mensagens').select('*').order('id', { ascending: false }).then(({ data }) => {
                console.log('Dados da consulta: ', data)
                setListaMensagem(data)
            })
            escutaMensagensEmTempoReal((novaMensagem) => {
                setListaMensagem((valorAtualLista) => {
                    return [
                        novaMensagem,
                        ...valorAtualLista,
                    ]
                })
            })
    }, [])

    function handleNovaMensagem(novaMensagem) {
        const mensagem = {
            de: usuarioLogado,
            texto: novaMensagem,
        }

        supabaseClient.from('mensagens').insert([
            mensagem
        ])
        .then(({ data }) => {
            console.log(data)
        })
        
        setMessagem('')
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList mensagens={listaMensagem} setListaMensagem={setListaMensagem}/>
                    
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(event) => {
                                const valor = event.target.value
                                setMessagem(valor)
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter' && mensagem === '') {
                                    event.preventDefault()
                                    return
                                } else if(event.key === 'Enter') {
                                    event.preventDefault()
                                    handleNovaMensagem(mensagem)
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker 
                            onStickerClick={(sticker) => {
                                handleNovaMensagem(':sticker: ' + sticker)
                            }}
                        />
                        <Button 
                            label='ENVIAR'
                            styleSheet={{
                                backgroundColor: 'green',
                                padding: '12px',
                                marginBottom: '8px',
                                marginLeft: '12px'
                            }}
                            buttonColors={{
                                contrastColor: appConfig.theme.colors.neutrals["000"],
                                mainColor: appConfig.theme.colors.primary[100],
                                mainColorLight: appConfig.theme.colors.primary[400],
                                mainColorStrong: appConfig.theme.colors.primary[600],
                              }}
                              onClick={() => {
                                  if (mensagem === '') {
                                      return
                                  } else {
                                      handleNovaMensagem(mensagem)
                                  }
                                }}
                                
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {

     async function handleDeleteMessage(mensagemId){
        await supabaseClient.from('mensagens').delete().match({ id: mensagemId });
        props.setListaMensagem(props.mensagens.filter((mensagem) => mensagem.id != mensagemId));
        
    }
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div>
                                <Image
                                    styleSheet={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        display: 'inline-block',
                                        marginRight: '8px',
                                    }}
                                    src={`https://github.com/${mensagem.de}.png`}
                                />
                                <Text tag="strong">
                                    {mensagem.de}
                                </Text>
                                <Text
                                    styleSheet={{
                                        fontSize: '10px',
                                        marginLeft: '8px',
                                        color: appConfig.theme.colors.neutrals[300],
                                    }}
                                    tag="span"
                                >
                                    {(new Date().toLocaleDateString())}
                                </Text>
                            </div>
                            <Button 
                                label='X'
                                styleSheet={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'red',
                                    width: '20px',
                                    height: '20px',
                                    padding: '0',
                                    
                                }}
                                buttonColors={{
                                    contrastColor: appConfig.theme.colors.neutrals["000"],
                                    mainColorStrong: '#bf1111',
                                  }}
                                onClick={() => handleDeleteMessage(mensagem.id)}
                            />
                        </Box>
                        {mensagem.texto.startsWith(':sticker:') ? (
                        <Image styleSheet={{
                            width: '180px',
                        }} src={mensagem.texto.replace(':sticker:', '')}/>
                        ):mensagem.texto}
                        {/* {mensagem.texto} */}
                    </Text>
                )
            })}


        </Box>
    )
}