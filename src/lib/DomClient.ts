import { JSDOM } from 'jsdom'
import Logger = require('bunyan')
import crypto from 'crypto'

export class QA {
  constructor(subj: string, category: string) {
    if (subj) this.subject = DomClient.denormalizeNodeName(subj)
    if (category) this.category = DomClient.denormalizeNodeName(category)
  }
  question: string
  answer: string
  service: string
  subject: string
  category: string
  questionHash: string
}
export class DomClient {
  private log: Logger
  private document: Document
  public h2NodeIds: string[]
  public subjectAndCategoryAndQas: QA[]
  subjectsFromH2Tags: string[]

  public constructor(html: string, log?: Logger) {
    this.log = log
    this.document = new JSDOM(html).window.document
  }
  public setSubjectsFromH2TagsAsArray() {
    const h2s = this.document.querySelectorAll('h2')
      , result = []
    for (var i = 0; i < h2s.length; i++) {
      result.push(h2s[i].textContent.trim())
    }
    this.subjectsFromH2Tags = result
  }
  public setH2NodeIds() {
    this.h2NodeIds = this.subjectsFromH2Tags
      .map((h) => DomClient.normalizeNodeName(h))
  }
  public setQAndAs(serviceName: string) {
    let subjectAndCategoriesAndQA: QA[] = []
    const main = this.document.querySelectorAll('[role="main"]')[0]
    if (!main) {
      this.log.error(Object.assign(this.document, { 'service': serviceName }))
      return
    }
    const qAndApTags = main.querySelectorAll('p')
    const qAndAarray = Array.from(qAndApTags)
    qAndApTags.forEach((qa) => {
      let qaItem = new QA(DomClient.getSubject(qa) ?
        DomClient.getSubject(qa) : '', DomClient.getCategory(qa) ? DomClient.getCategory(qa) : '')
      this.recurse(qa, qaItem, qAndAarray, subjectAndCategoriesAndQA)
    })
    subjectAndCategoriesAndQA = subjectAndCategoriesAndQA.filter((qa) => qa.question && qa.answer)
    if (subjectAndCategoriesAndQA.length > 0) subjectAndCategoriesAndQA.forEach((s) => s.questionHash = crypto.createHash('md5').update(s.question).digest('hex'))
    this.subjectAndCategoryAndQas = subjectAndCategoriesAndQA
  }
  private recurse(node: HTMLParagraphElement, qaObj: QA, qaS: HTMLParagraphElement[], subjectAndCategoriesAndQA: QA[]) {
    if (!node) return
    const text = node.textContent.trim()
    if (!text) return
    if (text.startsWith('Q:') || text.startsWith('Q.')) {
      qaObj.question = text
      this.recurse(qaS.shift(), qaObj, qaS, subjectAndCategoriesAndQA)
    } else {
      qaObj.answer = text
      subjectAndCategoriesAndQA.push(qaObj)
      this.recurse(qaS.shift()
        , new QA(DomClient.getSubject(node) ?
          DomClient.getSubject(node) : '', DomClient.getCategory(node) ? DomClient.getCategory(node) : '')
        , qaS
        , subjectAndCategoriesAndQA)
    }
  }
  static getSubject(html: HTMLParagraphElement) {
    return html.parentElement.parentElement.getElementsByTagName('h2')[0] ?
      html.parentElement.parentElement.getElementsByTagName('h2')[0].textContent.trim() : ''
  }
  static getCategory(html: HTMLParagraphElement) {
    return html.parentElement.parentElement.getElementsByTagName('h3')[0] ?
      html.parentElement.parentElement.getElementsByTagName('h3')[0].textContent.trim() : ''
  }
  private getServiceName(textContent: string) {
    return textContent.split(' FAQ')[0].replace('\n', '').replace(/\s\s+/g, ' ').trim()
  }
  private static normalizeNodeName(header: string) {
    return header
      .replace(/\s/g, '_')
      .replace(/&/g, '.26')
      .replace(/\(/g, '.28')
      .replace(/\)/g, '.29')
      .replace(/\,/g, '.2C')
      .replace(/\?/g, '.3F')
  }
  public static denormalizeNodeName(header: string) {
    return header
      .replace(/_/g, ' ')
      .replace(/.26/g, '&')
      .replace(/.28/g, '(')
      .replace(/.29/g, ')')
      .replace(/.2C/g, ',')
      .replace(/.3F/g, '?')
  }
}
