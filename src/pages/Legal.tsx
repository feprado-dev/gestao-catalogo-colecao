import { Link } from 'react-router-dom'
import { SITE } from '../config/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  useDocumentTitle(title)
  return (
    <div className="container legal">
      <header className="page-head">
        <p className="eyebrow">Informações legais</p>
        <h1>{title}</h1>
        <p className="subtitle">Última atualização: {SITE.legalUpdatedAt}</p>
      </header>
      {children}
      <p><Link to="/" className="btn">Voltar ao início</Link></p>
    </div>
  )
}

const mail = <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>

export function Privacy() {
  return (
    <LegalLayout title="Política de Privacidade e Cookies">
      <p>
        Esta política explica, em linguagem simples, quais dados o site trata, por quê, com quem eles passam e como você exerce
        seus direitos previstos na Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).
      </p>

      <h2>1. Quem é o responsável</h2>
      <p>{SITE.responsible}, nome do site: {SITE.name}. Contato para assuntos de privacidade: {mail}.</p>

      <h2>2. Quais dados tratamos</h2>
      <ul>
        <li><strong>Visitantes do catálogo público:</strong> não pedimos cadastro, nome nem e-mail. Como em qualquer site, o endereço IP e dados
          técnicos do navegador (tipo de aparelho, data e hora) são registrados nos servidores de hospedagem para entregar a página e
          garantir a segurança.</li>
        <li><strong>Dono da coleção (área privada):</strong> e-mail e senha para entrar. A senha é guardada apenas como hash, nunca em
          texto legível. O site não tem cadastro aberto: não existem contas de visitantes.</li>
        <li><strong>Dados do catálogo:</strong> título, edição, ano, condição e imagem de capa das revistas. Não são dados pessoais de
          visitantes.</li>
      </ul>
      <p>Coletamos <strong>somente o necessário</strong> para o site funcionar. Não pedimos documentos, telefone, endereço nem localização.</p>

      <h2>3. Cookies e armazenamento no navegador</h2>
      <p>O site <strong>não usa cookies de publicidade, estatísticas ou rastreamento</strong>, nem scripts de terceiros para esse fim
        (sem Google Analytics, Meta Pixel ou similares). Usamos apenas o armazenamento local do navegador (<code>localStorage</code>),
        para itens essenciais:</p>
      <ul>
        <li><code>tema</code>: lembra tema claro ou escuro;</li>
        <li><code>modo de visualização</code>: vertical, horizontal ou mosaico;</li>
        <li><code>idade-confirmada</code> e <code>aviso-armazenamento</code>: lembram que você já viu esses avisos;</li>
        <li>sessão de login: existe apenas para o dono, depois que ele entra.</li>
      </ul>
      <p>Por serem estritamente necessários, não dependem de consentimento. Você pode apagá-los a qualquer momento nas configurações do navegador;
        os avisos voltarão a aparecer.</p>
      <p>As fontes do site são servidas pelo próprio site, sem carregar arquivos do Google.</p>

      <h2>4. Para que usamos (finalidade e base legal)</h2>
      <ul>
        <li>Exibir o catálogo e permitir o login do dono: execução da funcionalidade solicitada e legítimo interesse (art. 7º, V e IX).</li>
        <li>Segurança e prevenção a abusos: legítimo interesse (art. 7º, IX).</li>
      </ul>
      <p>Não vendemos nem compartilhamos dados para marketing, e não tomamos decisões automatizadas sobre você.</p>

      <h2>5. Com quem os dados passam (operadores)</h2>
      <ul>
        <li><strong>Vercel Inc.</strong> (EUA): hospedagem do site.</li>
        <li><strong>Supabase Inc.</strong> (infraestrutura na região leste dos EUA): banco de dados, armazenamento das imagens e autenticação.</li>
      </ul>
      <p>Por isso pode haver <strong>transferência internacional</strong> de dados, realizada com esses provedores, que adotam medidas de
        segurança e contratos próprios de proteção de dados.</p>

      <h2>6. Por quanto tempo guardamos</h2>
      <p>Registros técnicos seguem a política de retenção dos provedores. Os dados da conta do dono ficam enquanto a conta existir. Os dados do
        catálogo ficam enquanto o item estiver publicado.</p>

      <h2>7. Seus direitos</h2>
      <p>Você pode pedir, a qualquer momento: confirmação de que tratamos dados seus, acesso, correção, anonimização, eliminação,
        informação sobre compartilhamentos e revogação de consentimento, quando houver. Escreva para {mail}; respondemos em prazo razoável.
        Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</p>

      <h2>8. Menores de idade</h2>
      <p>O conteúdo é destinado a <strong>maiores de 18 anos</strong>. O aviso de idade é uma declaração do visitante, não uma verificação
        documental.</p>

      <h2>9. Mudanças nesta política</h2>
      <p>Podemos atualizar este texto. A data no topo mostra a última revisão.</p>
    </LegalLayout>
  )
}

export function Terms() {
  return (
    <LegalLayout title="Termos de Uso">
      <h2>1. O que é este site</h2>
      <p>É um catálogo de <strong>coleção pessoal</strong> de revistas, mantido como {SITE.responsible.toLowerCase()}. Serve para organizar e
        consultar o acervo. Ao usar o site, você concorda com estes termos.</p>

      <h2>2. Conteúdo adulto</h2>
      <p>As capas podem conter nudez artística. O acesso é permitido <strong>apenas a maiores de 18 anos</strong>. Se você é menor de idade
        ou se esse conteúdo o ofende, não use o site.</p>

      <h2>3. Não há venda, cobrança nem reembolso</h2>
      <p>O site <strong>não vende produtos nem serviços</strong>, não cobra nada e não coleta pagamentos. Por isso não existe política de
        reembolso nem de troca. Qualquer pessoa ou página que ofereça compras em nome deste site <strong>não nos representa</strong>.</p>

      <h2>4. Informações e promessas</h2>
      <p>O site <strong>não publica avaliações, depoimentos ou classificações de terceiros</strong> e não faz promessas de resultado. As
        informações do catálogo (ano, edição, condição) são anotações do dono e podem conter imprecisões. A condição é uma avaliação pessoal.</p>

      <h2>5. Uso permitido</h2>
      <p>É proibido tentar acessar a área privada sem autorização, sobrecarregar o site, extrair o conteúdo em massa de forma automatizada ou usar
        o catálogo para fins ilícitos.</p>

      <h2>6. Direitos autorais e marca</h2>
      <p>Veja a página <Link to="/direitos-autorais">Direitos autorais</Link>. As capas e a marca pertencem aos seus titulares.</p>

      <h2>7. Disponibilidade e responsabilidade</h2>
      <p>O site é oferecido como está, sem garantia de funcionamento contínuo. Podemos alterar, suspender ou encerrar o site a qualquer momento,
        sem aviso prévio.</p>

      <h2>8. Privacidade</h2>
      <p>O tratamento de dados está descrito na <Link to="/privacidade">Política de Privacidade e Cookies</Link>.</p>

      <h2>9. Lei aplicável e contato</h2>
      <p>Estes termos seguem as leis do Brasil. Dúvidas: {mail}.</p>
    </LegalLayout>
  )
}

export function Copyright() {
  return (
    <LegalLayout title="Direitos Autorais e Marcas">
      <h2>De quem são as imagens</h2>
      <p>As capas exibidas são <strong>fotografias de exemplares da coleção pessoal</strong> do dono do site, mostradas para fins de catalogação e
        consulta, sem finalidade comercial. Os direitos sobre as capas, fotografias, textos, nomes e marcas pertencem às editoras, aos
        fotógrafos, às pessoas retratadas e aos demais titulares originais. A exibição aqui <strong>não transfere nem concede</strong> nenhum
        direito sobre esse material.</p>

      <h2>Marca e independência</h2>
      <p>Este site é um projeto independente e <strong>não tem vínculo, patrocínio ou autorização</strong> dos titulares da marca citada nas
        capas. Todos os nomes e marcas pertencem aos seus respectivos donos.</p>

      <h2>Pedido de remoção</h2>
      <p>Se você é titular de direitos, ou aparece em uma capa, e deseja que um item seja retirado, escreva para {mail} informando qual item
        (título e edição). Analisamos e <strong>retiramos o material prontamente</strong>.</p>

      <h2>Outros materiais</h2>
      <p>O código-fonte e o desenho da interface do site são de autoria do responsável.</p>
    </LegalLayout>
  )
}
