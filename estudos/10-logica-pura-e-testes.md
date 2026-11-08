# 10. Lógica pura e testes

## Objetivo
Entender o que são testes automatizados, por que escrevemos testes para `filters.ts` e `parseCoverFilename.ts` (e
não para as telas), como o Vitest funciona e como o **TDD** (escrever o teste primeiro) muda a forma de programar.

---

## 1. Por que testar

Sem testes, a única forma de saber se algo ainda funciona é **abrir o app e clicar em tudo**. Isso é lento,
cansativo e ninguém faz com a frequência necessária. Com 30 testes, você descobre em **um segundo**:

```
 Test Files  2 passed (2)
      Tests  30 passed (30)
```

Testes são uma **rede de segurança**. Você pode refatorar, otimizar e acrescentar funcionalidades **sem medo**
de quebrar o que já funcionava. E funcionam como **documentação executável**: o nome de cada teste descreve um
comportamento.

---

## 2. O que dá para testar facilmente: funções puras

Uma **função pura**:
1. Dado o mesmo argumento, **sempre** devolve o mesmo resultado.
2. **Não** altera nada fora dela (sem rede, sem tela, sem banco, sem `Date.now()` solto).

```ts
// pura: só depende do que recebe
export function parseCoverFilename(filename: string): ParsedCover { ... }

// NÃO pura: depende do banco e de internet
export async function listMyMagazines(userId: string) { ... await supabase... }
```

Funções puras são **fáceis de testar**: você monta a entrada, chama, confere a saída. Sem servidor, sem navegador,
sem preparar nada. Os 30 testes rodam em ~100 milissegundos.

> **Consequência para o design:** é por isso que a lógica de filtro mora em `lib/filters.ts` (puro) e não dentro do
> `Catalog.tsx` (cheio de estado e efeitos). **Código que mistura tudo é difícil de testar. Separar a lógica da
> tela é o que torna o teste possível.**

---

## 3. Vitest em 5 minutos

```ts
import { describe, expect, it } from 'vitest'
import { parseCoverFilename } from './parseCoverFilename'

describe('parseCoverFilename', () => {                      // um grupo, por assunto
  it('extrai edição, ano, mês e título', () => {            // UM comportamento, em português
    expect(parseCoverFilename('99__12__Playboy-No-293-Joana-Prado-Feiticeira.jpg')).toEqual({
      title: 'Joana Prado Feiticeira',
      issue: '293',
      year: 1999,
      month: 12,
    })
  })
})
```

| Peça | Papel |
|---|---|
| `describe('assunto', () => {...})` | Agrupa testes relacionados |
| `it('faz tal coisa', () => {...})` | Um teste. O texto é uma frase que descreve o comportamento |
| `expect(valor)` | "Quero conferir este valor" |
| `.toEqual(esperado)` | Igualdade **profunda** (compara o conteúdo de objetos e arrays) |
| `.toBe(esperado)` | Igualdade estrita (`===`), para valores simples |
| `.toMatchObject({...})` | O objeto **contém pelo menos** estes campos |
| `.toHaveLength(n)` | O array tem `n` itens |

### Rodando
```bash
npm test               # roda tudo uma vez
npm run test:watch     # fica rodando a cada salvamento (ótimo enquanto escreve)
```

Um arquivo de teste vive **ao lado** do que testa e termina em `.test.ts` (`filters.test.ts`).

---

## 4. A estrutura de um bom teste: Arrange, Act, Assert

```ts
it('ignora acentos e maiúsculas', () => {
  // ARRANGE (preparar): dados conhecidos
  const list = [
    makeMagazine({ title: 'Edição de Verão', cover_model: 'Ana Souza' }),
    makeMagazine({ title: 'Especial de Inverno', cover_model: null }),
  ]
  // ACT (agir): chamar a função
  const result = applyFilters(list, filters({ search: 'EDICAO' }))
  // ASSERT (conferir): o resultado é o esperado?
  expect(titles(result)).toEqual(['Edição de Verão'])
})
```

Três fases: **prepare** os dados, **execute** a função, **confira** o resultado. Se um teste não segue isso,
costuma estar fazendo coisa demais.

### Regras de um bom teste
1. **Um assunto por teste.** Quando falha, você sabe o motivo sem investigar.
2. **O nome diz o comportamento** ("ignora acentos e maiúsculas"), não a implementação ("testa o normalize").
3. **Independente:** um teste não pode depender de outro rodar antes.
4. **Rápido e determinístico:** sem depender de rede, hora ou sorte.

---

## 5. A "fábrica" de dados de teste

📁 `src/lib/filters.test.ts`:
```ts
function makeMagazine(overrides: Partial<Magazine> = {}): Magazine {
  return {
    id: crypto.randomUUID(),
    title: 'Revista',
    year: 2000,
    month: 1,
    condition: 'Bom',
    acquired: true,
    is_public: false,
    ...overrides,                 // o que o teste informar vence os valores padrão
  }
}
```

Uso: `makeMagazine({ title: 'Banana', year: 1990 })`.

Sem a fábrica, cada teste repetiria todos os campos de uma `Magazine`. Com ela, **cada teste só diz o que
importa para ele**, e o resto vem de valores padrão. Os testes ficam curtos e legíveis, e se `Magazine` ganhar
um campo, você altera **um** lugar.

Pequenos auxiliares ajudam a leitura:
```ts
const titles = (list: Magazine[]) => list.map((m) => m.title)
```

---

## 6. O que testar: casos de borda

Os testes mais valiosos não são os "caminho feliz". São os **cantos**, onde os bugs moram.

📁 O que `filters.test.ts` cobre além do óbvio:

| Caso de borda | Por que importa |
|---|---|
| Lista vazia | Funções costumam quebrar com `[]` |
| `cover_model` é `null` | A busca junta texto; `null` não pode virar `"null"` |
| Espaços nas pontas (`'  verão  '`) | O usuário digita com espaço sem perceber |
| Acentos e maiúsculas | `EDICAO` deve achar `Edição` |
| Desempate de ano pelo mês | Duas revistas do mesmo ano |
| Revistas **sem ano** | Devem ir para o **fim** nas duas direções |
| **Não alterar a lista original** | A regra de imutabilidade do React |

📁 `parseCoverFilename.test.ts`:
| Caso de borda | Por que importa |
|---|---|
| Sublinhado simples (`89_03`) em vez de duplo | O nome real de um arquivo tinha esse formato |
| Mês 13 | Deve virar `null`, não um mês inválido |
| Sem prefixo de data | Ano e mês `null`, edição mantida |
| Nome fora do padrão | Cai no título limpo |
| Arquivo `.jpg` sem nome | `'Sem título'` |
| `Dra.-Silva.jpg` | Só a **última** extensão sai |

**Pergunta para fazer a cada função:** "o que acontece se a entrada for vazia? `null`? gigante? esquisita?"

---

## 7. TDD: o teste vem **primeiro**

**TDD** = *Test-Driven Development*. O ciclo:

```
1. 🔴 VERMELHO   Escreva um teste do comportamento desejado. Rode: ele FALHA.
2. 🟢 VERDE      Escreva o código MÍNIMO para o teste passar.
3. 🔵 AZUL       Melhore o código (refatore) mantendo os testes verdes.
   └──────────── repita para o próximo comportamento
```

### Como foi com o `parseCoverFilename`
1. Escrevemos **11 testes** descrevendo como o nome do arquivo deveria ser lido.
2. Rodamos `npm test`. Resultado:
   ```
   FAIL  src/lib/parseCoverFilename.test.ts
   Error: Cannot find module './parseCoverFilename'
   ```
   **Falhou, como esperado:** o módulo nem existia. (Um teste que nunca falhou não prova nada.)
3. Escrevemos a função. Rodamos de novo: **30 passando** (19 antigos + 11 novos).

### Por que é bom
- **Você pensa no comportamento antes do código.** O teste vira a *especificação*.
- **Você só escreve o que é necessário.**
- **Você ganha os testes de graça**, junto com o código.
- **Menos medo de mexer depois.**

> TDD não é obrigatório em tudo. Brilha em **lógica com regras** (formatar, filtrar, validar, calcular). Em
> telas, costuma ser exagero.

---

## 8. Um teste que nunca falha não vale nada: o teste de mutação manual

Como saber se os testes realmente pegam erros? **Quebre o código de propósito.**

Fizemos isto com `filters.ts`: trocamos
```ts
(b.year ?? 0) - (a.year ?? 0)        // maior para o menor
```
por
```ts
(a.year ?? 0) - (b.year ?? 0)        // inverte a ordem
```
Resultado: **exatamente um teste falhou**, o de "mais novas primeiro", com a mensagem
`expected ['Banana', 'Cereja', 'Abacaxi'] to deeply equal ['Abacaxi', 'Cereja', 'Banana']`. Restauramos, e os 17
passaram.

Isso prova que os testes **estão vigiando** aquela linha. Existem ferramentas que fazem isso automaticamente
("testes de mutação"), mas fazer à mão uma vez é uma excelente forma de aprender.

🧪 **Experimente:** em `filters.ts`, troque `!==` por `===` na linha do filtro de condição. Rode `npm test`.
Quais testes falham? Desfaça com `git restore src/lib/filters.ts`.

---

## 9. O que **não** estamos testando (e como seria)

| Camada | Tem teste? | O que seria preciso |
|---|---|---|
| Funções puras (`lib/`) | ✅ Sim | Vitest, o que já temos |
| Componentes React | ❌ Não | **Testing Library**: renderiza o componente num "navegador falso" e simula cliques |
| Fluxo completo no navegador | ❌ Não | **Playwright**: abre um navegador de verdade e usa o site |
| Serviços que falam com o Supabase | ❌ Não | Um **mock** (substituto falso) do cliente, ou um banco de teste |

Uma estratégia comum é a **pirâmide de testes**: **muitos** testes de lógica (rápidos e baratos), **alguns**
de componentes, **poucos** ponta a ponta (lentos e frágeis). O projeto tem a base da pirâmide; os andares de cima
são o próximo estudo.

---

## 10. Testes + git + deploy

O fluxo ideal antes de cada commit:
```bash
npx tsc -b && npm test && npm run build
```
Num projeto profissional, isso roda **automaticamente** a cada `git push` (integração contínua), e o deploy só
acontece se tudo passar. Aqui, quem faz isso é você, à mão.

---

## Erros comuns
| Sintoma | Causa | Solução |
|---|---|---|
| Teste passa, mas o app está quebrado | O teste não cobre aquele caminho | Escreva um teste que **reproduza** o bug primeiro |
| Teste frágil: falha por motivos aleatórios | Depende de hora, rede ou ordem | Torne-o determinístico e independente |
| Muitos testes quebram a cada mudança pequena | Testam a implementação, não o comportamento | Teste entradas e saídas, não detalhes internos |
| `expected [..] to be [..]` com arrays iguais | Usou `toBe` para arrays/objetos | Use `toEqual` |
| Nunca tem tempo para testar | Testes demais no final, em vez de aos poucos | Escreva o teste **junto** com a função |

## Exercícios
1. Rode `npm run test:watch`, estrague uma linha de `applyFilters` e veja quais testes falham. Desfaça.
2. **TDD de verdade:** escreva `formatMagazineDate(month, year)` que devolva `'03/1999'`, `'1999'` ou `''`.
   Primeiro **os testes** (vermelho), depois a função (verde). Depois use-a no `MagazineCard`.
3. Escreva um teste de ordenação por título com **dois títulos iguais**. O que você espera? O código atual
   atende?
4. Pesquise `@testing-library/react` e escreva um teste que renderize o `MagazineCard` e confira que o título
   aparece e que, **sem** `onDelete`, o botão "Deletar" **não** existe.
5. **Desafio:** adicione `vitest --coverage` (pacote `@vitest/coverage-v8`) e descubra quais linhas de `lib/` ainda
   não são cobertas por testes.

✅ **Checklist do capítulo 10**
- [ ] Explico o que é uma função pura e por que é fácil de testar.
- [ ] Leio e escrevo `describe`, `it` e `expect(...).toEqual(...)`.
- [ ] Organizo um teste em Arrange, Act, Assert.
- [ ] Uso uma fábrica de dados para testes curtos.
- [ ] Lembro de testar casos de borda (vazio, `null`, espaços, acentos).
- [ ] Conto o ciclo vermelho, verde, azul com o `parseCoverFilename`.
- [ ] Sei por que "quebrar de propósito" valida os testes.
- [ ] Sei o que o projeto ainda não testa e como seria.

Próximo: [11. Git e GitHub](11-git-e-github.md).
