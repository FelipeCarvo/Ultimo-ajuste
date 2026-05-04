import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent implements OnChanges {

  @Input() lista: any[] = [];
  @Input() placeholder: string = '';
  @Input() campoDescricao: string = 'descricao';
   @Input() disabled: boolean = false;


  /** 🔥 VALOR SELECIONADO (ID) */
  @Input() valorSelecionado: any;

  @Output() selecionado = new EventEmitter<any>();
  @Output() dropdownAberto = new EventEmitter<void>();
  @Output() buscaAlterada = new EventEmitter<string>();

  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  textoBusca = '';
  listaFiltrada: any[] = [];
  aberto = false;

  // =============================
  // 🔄 ATUALIZA QUANDO RECEBE ID
  // =============================
  ngOnChanges(changes: SimpleChanges) {
    const valorSelecionadoMudou = !!changes['valorSelecionado'];
    const listaMudou = !!changes['lista'];

    if (valorSelecionadoMudou || (listaMudou && this.temValorSelecionado())) {
      this.sincronizarValorSelecionado();
    }

    if (listaMudou && this.aberto) {
      this.atualizarListaFiltrada();
    }
  }

  private temValorSelecionado(): boolean {
    return !(
      this.valorSelecionado === null ||
      this.valorSelecionado === undefined ||
      String(this.valorSelecionado).trim() === ''
    );
  }

  private sincronizarValorSelecionado() {
    const valorNaoInformado = !this.temValorSelecionado();

    if (valorNaoInformado || !this.lista?.length) {
      if (!this.aberto) {
        this.textoBusca = '';
      }
      return;
    }

    const item = this.lista.find(
      (i: any) =>
        String(i.id ?? i.codigo ?? i.valor) === String(this.valorSelecionado)
    );

    if (item) {
      this.textoBusca = this.getDescricao(item);
      return;
    }

    this.textoBusca = '';
  }

  // =============================
  // 🔎 DESCRIÇÃO DO ITEM
  // =============================
  getDescricao(item: any): string {
    return (
      item?.[this.campoDescricao] ||
      item?.descricao ||
      item?.nome ||
      ''
    );
  }

  abrirDropdown() {
    if (this.disabled) {
      return;
    }

    this.aberto = true;
    this.listaFiltrada = [...this.lista];
    this.dropdownAberto.emit();

    setTimeout(() => {
      this.inputRef?.nativeElement.focus();
    });
  }

  filtrar() {
    if (this.disabled) {
      this.aberto = false;
      return;
    }

    this.aberto = true;
    this.buscaAlterada.emit(this.textoBusca || '');

    this.atualizarListaFiltrada();
  }

  private atualizarListaFiltrada() {
    const termo = (this.textoBusca || '').toLowerCase();

    if (!termo) {
      this.listaFiltrada = [...this.lista];
      return;
    }

    this.listaFiltrada = this.lista.filter(item =>
      this.getDescricao(item).toLowerCase().includes(termo)
    );
  }

  selecionar(item: any) {
    this.textoBusca = this.getDescricao(item);
    this.aberto = false;
    this.selecionado.emit(item);
  }

  limpar() {
    if (this.disabled) return;

    this.textoBusca = '';
    this.listaFiltrada = [...this.lista];
    this.aberto = false;
    this.buscaAlterada.emit('');
    this.selecionado.emit(null);
  }

  isSelecionado(item: any): boolean {
    if (!item) return false;
    // Compara por id, codigo ou valor
    const idItem = String(item.id ?? item.codigo ?? item.valor);
    const idSelecionado = String(this.valorSelecionado);
    return idItem === idSelecionado;
  }

  fecharComDelay() {
    setTimeout(() => {
      this.aberto = false;
    }, 150);
  }
}
