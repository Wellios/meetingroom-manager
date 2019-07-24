import React, { Component } from 'react';
import { Container, Form, TitleInput, Select, TimeSelect, Button } from './styles';
import DatePicker, { registerLocale } from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import ptBR from 'date-fns/locale/pt-BR';
registerLocale('pt-BR', ptBR);
import api from '../../services/api'
import { format } from 'date-fns'

export default class Dashboard extends Component {
    state = {
        data: [],
        title: '',
        roomSelect: '',
        date: '',
        initial: '',
        end: '',
        error: null,
    }

    componentDidMount(){
        this.fetchRooms()
    }

    setBook = async (e) => {
        e.preventDefault();
        const { title, roomSelect, date, initial, end }= this.state

        if(!title || !roomSelect || !date || !initial || !end){
            this.setState({
                error: "Você precisa preencher todos os campos!"
            })
        }else{
            const dateFormat = format(date, 'YYYY-MM-DD');
            const initialFormat = format(initial, 'HH:mm')
            const endFormat = format(end, 'HH:mm')

            const book = {
                Title: title,
                RoomId: roomSelect,
                InitialPeriod: `${dateFormat} ${initialFormat}`,
                EndPeriod: `${dateFormat} ${endFormat}`
            }

            try{
                await api.post('roomuser/add', book)
            }catch(err){
                console.log(err)
                this.setState({
                    error: "Este horário já está reservado."
                })
            }
        }
    }

    fetchRooms = async () => {
        try{
            const { data } = await api.get('room/index')

            this.setState({
                data: [...data]
            })
        }catch(err){
            this.setState({
                error: "Você não cadastrou nenhuma sala de reunião!"
            })
        }
    }
    
    render() {
        const { data, title, roomSelect, date, initial, end } = this.state
        return (
            <Container>
                <Form onSubmit={this.setBook}>
                    <TitleInput 
                        onChange={e => this.setState({ title: e.target.value })} 
                        value={title}
                        placeholder="Digite o título da sua reserva"
                    />
                    <Select onChange={e => this.setState({ roomSelect: e.target.value })} value={roomSelect}>
                        <option value="">Selecione a sala de reunião</option>
                        {data.map(room => <option key={room.id} value={room.id}>Sala {room.name}</option>)}
                    </Select>
                    <DatePicker
                        placeholderText="Selecione a data da reserva"
                        className="datepicker"
                        selected={date}
                        onChange={date => this.setState({ date })}
                        locale="pt-BR"
                        minDate={new Date()}
                        dateFormat="MMMM d, yyyy h:mm aa"
                    />
                    <TimeSelect>
                        <DatePicker
                            placeholderText="Selecione a hora de início da reserva"
                            className="datepicker"
                            selected={initial}
                            onChange={initial => this.setState({ initial })}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            dateFormat="h:mm aa"
                        />
                        <DatePicker
                            placeholderText="Selecione a hora de termino da reserva"
                            className="datepicker"
                            selected={end}
                            onChange={end => this.setState({ end })}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            dateFormat="h:mm aa"
                        />
                    </TimeSelect>
                    <Button type="submit">Enviar</Button>
                </Form>
            </Container>
        );
    }
}
