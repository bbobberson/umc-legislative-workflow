import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const sql = neon(process.env.POSTGRES_URL!)

const diverseParagraphs = [
  // Social Justice & Human Rights
  { number: '¶165', title: 'Economic Justice', section: 'Social Principles', current_text: 'We hold governments responsible for the protection of the rights of the people to free and fair elections and to the civil liberties of expression, religion, communication, assembly, and petition for redress of grievances without fear of reprisal or violence. We assert the right of all persons to education, security, health care, food, shelter, and full participation in the decisions that affect their lives.' },
  { number: '¶166', title: 'Rights of Racial and Ethnic Persons', section: 'Social Principles', current_text: 'Racism is the combination of the power to dominate by one race over other races and a value system that assumes that the dominant race is innately superior to others. Racism includes both personal and institutional racism. Personal racism is manifested through the individual expressions, attitudes, and/or behaviors that accept the assumptions of a racist value system and that maintain the benefits of this system. Institutional racism is the established social pattern that supports implicitly or explicitly the racist value system.' },
  { number: '¶167', title: 'Rights of Children', section: 'Social Principles', current_text: 'Once a child is born, a new life has begun. We must move beyond the rhetoric of the abortion debate to caring for mothers and children. We recognize the developing technologies of human reproduction, affirm the natural means of conception, and encourage research that advances understanding while respecting the sanctity of life.' },
  { number: '¶168', title: 'Rights of Young People', section: 'Social Principles', current_text: 'Our society is failing its youth. We call for an end to policies that harm young people and work toward those that help them reach their full potential. Young people must be valued, included, and empowered in the church. They deserve to be heard and have their gifts celebrated.' },
  { number: '¶169', title: 'Rights of Aging', section: 'Social Principles', current_text: 'In a society that values persons primarily in terms of their economic productivity, those whose productivity has declined are seen as burdens. We affirm the responsibility of the Christian community to be in ministry with aging persons, providing adequate support systems and facilities.' },
  
  // Climate & Environment 
  { number: '¶170', title: 'Climate Change and Environmental Justice', section: 'Social Principles', current_text: 'We acknowledge that climate change is a moral issue because it disproportionately impacts the most vulnerable populations worldwide. As followers of Jesus Christ, we are called to be stewards of creation and advocates for environmental justice. We commit to reducing carbon emissions, supporting renewable energy, and caring for Gods creation.' },
  { number: '¶171', title: 'Renewable Energy and Sustainability', section: 'Social Principles', current_text: 'The United Methodist Church recognizes the urgent need to transition to renewable energy sources and sustainable practices. We encourage local churches and church-related institutions to adopt solar panels, energy-efficient systems, and sustainable building practices as expressions of faithful stewardship.' },
  { number: '¶172', title: 'Water as a Human Right', section: 'Social Principles', current_text: 'We believe access to clean water is a fundamental human right. We oppose the privatization of water resources and support public policies that ensure equitable access to safe drinking water for all people, especially those in marginalized communities affected by environmental injustice.' },
  
  // Technology & Digital Life
  { number: '¶173', title: 'Digital Privacy and Technology Ethics', section: 'Social Principles', current_text: 'In our increasingly digital world, we affirm the right to privacy and protection of personal data. We call for ethical use of artificial intelligence, responsible social media practices, and corporate accountability in technology development that respects human dignity and promotes the common good.' },
  { number: '¶174', title: 'Cybersecurity and Digital Safety', section: 'Social Principles', current_text: 'As digital technologies become integral to daily life, we recognize the need for cybersecurity measures that protect individuals and institutions while preserving civil liberties. We encourage education about digital literacy and safe online practices.' },
  
  // Church Structure & Ministry
  { number: '¶320', title: 'Licensed Local Pastor', section: 'Ministry', current_text: 'A licensed local pastor is authorized to perform the duties of a pastor in the charge to which appointed, including conducting divine worship, preaching, performing marriages where authorized by law, burying the dead, administering the sacraments, and carrying out other pastoral duties as assigned.' },
  { number: '¶321', title: 'Associate Member', section: 'Ministry', current_text: 'Associate members are persons who have fulfilled the educational and service requirements but are not available for itinerant appointment. They may serve in extension ministries or in appointed ministries within the annual conference.' },
  { number: '¶322', title: 'Provisional Member', section: 'Ministry', current_text: 'Provisional membership is a covenant between persons called to ordained ministry and the Church, demonstrated through candidacy and the educational process. Provisional members commit to the journey toward full ordination and effectiveness in ministry.' },
  { number: '¶323', title: 'Full Member and Elder', section: 'Ministry', current_text: 'Elders are ordained ministers who have completed their education, demonstrated their gifts and graces, and committed to full connection with the annual conference. They are authorized to preach and teach the Word of God, administer the sacraments, and order the life of the church.' },
  { number: '¶324', title: 'Deacon in Full Connection', section: 'Ministry', current_text: 'Deacons are ordained ministers called to ministries of Word and Service. They are authorized to conduct worship, preach, teach, lead in service to the poor, and assist elders at the table. Deacons exemplify discipleship and call others to servant leadership.' },
  
  // Worship & Sacraments
  { number: '¶340', title: 'The Sacraments', section: 'Worship and Liturgy', current_text: 'We recognize two sacraments: baptism and the Lords Supper. These are means of grace through which God works invisibly in us, quickening, strengthening, and confirming our faith in him. They are never to be understood as mere symbols but as actual means through which God imparts grace.' },
  { number: '¶341', title: 'Holy Baptism', section: 'Worship and Liturgy', current_text: 'Baptism is not only a sign of profession and mark of difference whereby Christians are distinguished from others, but it is also a sign of regeneration or the new birth. By water and the Spirit, persons are made disciples of Jesus Christ and initiated into Christs holy Church.' },
  { number: '¶342', title: 'Holy Communion', section: 'Worship and Liturgy', current_text: 'The Lords Supper is a representation of our redemption, a memorial of the sufferings and death of Christ, and a token of love and union that Christians have with Christ and with one another. Those who receive it worthily feed on Christ in their hearts by faith with thanksgiving.' },
  { number: '¶343', title: 'Christian Marriage', section: 'Worship and Liturgy', current_text: 'We affirm the sanctity of the marriage covenant which is expressed in love, mutual support, personal commitment, and shared fidelity between a man and a woman. We believe that God has a plan for human sexuality that finds its highest fulfillment in the loving relationship of marriage.' },
  { number: '¶344', title: 'Death and Resurrection', section: 'Worship and Liturgy', current_text: 'We believe in the resurrection of the dead and life everlasting. Death is not the end of our existence but a transition to fuller life with God. We celebrate the lives of those who have died and comfort those who mourn with the hope of reunion in Gods eternal kingdom.' },
  
  // Global Church & Mission
  { number: '¶430', title: 'Global Mission and Evangelism', section: 'Global Ministry', current_text: 'The mission of the Church is to make disciples of Jesus Christ for the transformation of the world. This mission extends to all nations and peoples, calling us to share the good news of Gods love through word and deed, working for justice, peace, and the integrity of creation.' },
  { number: '¶431', title: 'Cross-Racial and Cross-Cultural Appointments', section: 'Global Ministry', current_text: 'We affirm the importance of cross-racial and cross-cultural appointments as a means of modeling the inclusiveness of the gospel and building bridges between communities. Such appointments require careful preparation, ongoing support, and commitment from both clergy and congregations.' },
  { number: '¶432', title: 'Ministry with the Poor', section: 'Global Ministry', current_text: 'Jesus ministry began with the declaration that he came to bring good news to the poor. The Church is called to be in solidarity with the poor and marginalized, working for economic justice, providing direct service, and advocating for policies that address the root causes of poverty.' },
  
  // Education & Youth
  { number: '¶510', title: 'Christian Education Principles', section: 'Education and Ministry', current_text: 'Christian education is the church\'s responsibility to provide opportunities for people to encounter the living Christ and grow in discipleship. It involves the whole person in a lifelong process of learning, faith formation, and service to others in the name of Jesus Christ.' },
  { number: '¶511', title: 'Children and Youth Ministry', section: 'Education and Ministry', current_text: 'We recognize children and youth as full members of the church community with unique gifts and perspectives. Ministry with children and youth includes faith formation, leadership development, mission engagement, and creating safe spaces for questioning and growth.' },
  { number: '¶512', title: 'Adult Faith Formation', section: 'Education and Ministry', current_text: 'Adult faith formation is a lifelong journey of spiritual growth that includes study, prayer, service, and community engagement. Adults are called to deepen their understanding of faith, develop their spiritual practices, and use their gifts in service to God and others.' },
  
  // Health & Healing
  { number: '¶520', title: 'Health and Healing Ministry', section: 'Health and Wellness', current_text: 'We believe that health is a gift from God and that the church has a ministry of healing that includes caring for the physical, mental, emotional, and spiritual well-being of persons. We support healthcare as a human right and advocate for accessible, affordable healthcare for all.' },
  { number: '¶521', title: 'Mental Health Awareness', section: 'Health and Wellness', current_text: 'Mental health is an integral part of overall health and human dignity. We affirm the need to eliminate stigma surrounding mental illness, provide compassionate care for those who suffer, and support research and treatment that promotes mental wellness and recovery.' },
  { number: '¶522', title: 'Disability and Inclusion', section: 'Health and Wellness', current_text: 'Persons with disabilities are individuals created in Gods image with inherent dignity and worth. The church is called to ensure full inclusion and accessibility in all aspects of church life, removing barriers and creating welcoming communities where all can participate fully.' },
  
  // Peace & Justice
  { number: '¶530', title: 'War and Peace', section: 'Peace and Justice', current_text: 'We believe war is incompatible with the teachings and example of Christ. While we recognize the tragic necessity of armed force in some circumstances, we commit ourselves to the pursuit of peace through negotiation, mediation, and nonviolent resistance to evil.' },
  { number: '¶531', title: 'Nuclear Disarmament', section: 'Peace and Justice', current_text: 'We call for the elimination of nuclear weapons and the redirection of resources from weapons of mass destruction to meeting human needs. Nuclear weapons pose an unacceptable threat to all life on earth and contradict our Christian commitment to the sanctity of life.' },
  { number: '¶532', title: 'Criminal Justice Reform', section: 'Peace and Justice', current_text: 'We advocate for a criminal justice system that prioritizes restoration over retribution, rehabilitation over punishment. We support alternatives to incarceration, oppose the death penalty, and work for reforms that address the root causes of crime and promote healing for victims and communities.' },
  
  // Family Life
  { number: '¶540', title: 'Family Life and Parenting', section: 'Family and Relationships', current_text: 'The family is the basic unit of society and plays a crucial role in shaping individuals and communities. We support parents in their sacred responsibility to nurture children, provide guidance and discipline, and model Christian values through their daily lives.' },
  { number: '¶541', title: 'Single Life and Singleness', section: 'Family and Relationships', current_text: 'We affirm that singleness is a gift from God and a valid way of living out ones Christian calling. Single persons contribute unique perspectives and gifts to the church community and should be supported and included fully in church life and leadership.' },
  { number: '¶542', title: 'Divorce and Remarriage', section: 'Family and Relationships', current_text: 'While we believe marriage is intended to be a lifelong covenant, we recognize that some marriages fail despite the best efforts of the couple. We offer pastoral care and support to those experiencing divorce and welcome those who remarry into the full life of the church.' },
  
  // Communications & Media
  { number: '¶610', title: 'Communication and Media Ministry', section: 'Communication', current_text: 'The gospel message must be communicated effectively in every generation using the tools and technologies available. We encourage innovation in communication ministry while maintaining fidelity to the Christian message and promoting responsible media consumption.' },
  { number: '¶611', title: 'Truth in Communications', section: 'Communication', current_text: 'Christians are called to be truth-tellers in all forms of communication. We oppose misinformation, propaganda, and hate speech while affirming the importance of free expression and open dialogue in democratic society.' },
  
  // Stewardship & Finance
  { number: '¶620', title: 'Principles of Stewardship', section: 'Stewardship', current_text: 'Stewardship is the practice of caring for all that God has entrusted to us: our time, talents, treasure, and the earth itself. Christians are called to be faithful stewards who use resources wisely, share generously, and live simply so that others may simply live.' },
  { number: '¶621', title: 'Tithing and Proportional Giving', section: 'Stewardship', current_text: 'We encourage the biblical practice of tithing (giving 10% of income) as a spiritual discipline that acknowledges Gods ownership of all we possess. For those unable to tithe, we encourage proportional giving that reflects their commitment to faithful stewardship.' },
  { number: '¶622', title: 'Environmental Stewardship', section: 'Stewardship', current_text: 'Care for creation is a fundamental Christian responsibility. We call upon all United Methodists to adopt sustainable practices, reduce consumption, support renewable energy, and advocate for policies that protect the environment for future generations.' },
  
  // Evangelism & Church Growth
  { number: '¶630', title: 'Evangelism and Witness', section: 'Evangelism', current_text: 'Evangelism is the sharing of the good news of Gods love in Jesus Christ with others through word and deed. Every Christian is called to be an evangelist, offering invitation to faith and demonstrating Gods love through acts of compassion, justice, and service.' },
  { number: '¶631', title: 'New Church Development', section: 'Evangelism', current_text: 'Starting new churches is essential for reaching new people and expanding the mission of the Church. We encourage innovative approaches to church planting that reflect the diverse communities we seek to serve while maintaining connection to the broader United Methodist tradition.' },
  
  // Higher Education
  { number: '¶640', title: 'United Methodist Higher Education', section: 'Education', current_text: 'United Methodist colleges, universities, and theological schools play a vital role in preparing leaders and advancing knowledge. These institutions should maintain their Christian identity while fostering academic excellence, critical thinking, and service to society.' },
  { number: '¶641', title: 'Seminary Education', section: 'Education', current_text: 'Theological education is essential for preparing effective clergy and lay leaders. Seminary education should combine academic rigor with practical ministry experience, spiritual formation with intellectual development, and traditional knowledge with innovative approaches to ministry.' },
  
  // Healthcare & Institutions
  { number: '¶650', title: 'United Methodist Healthcare Institutions', section: 'Healthcare', current_text: 'United Methodist hospitals, clinics, and health ministries embody the healing ministry of Jesus Christ. These institutions should provide compassionate care to all persons regardless of their ability to pay, advocate for healthcare access, and maintain high ethical standards in all practices.' },
  { number: '¶651', title: 'Bioethics and Medical Research', section: 'Healthcare', current_text: 'Advances in medical science offer hope for treating disease and alleviating suffering, but they also raise ethical questions. We support medical research that respects human dignity, protects vulnerable populations, and advances the common good while opposing research that treats human life as expendable.' },
  
  // Aging & End of Life
  { number: '¶660', title: 'Aging with Dignity', section: 'Life Issues', current_text: 'Growing older is a natural part of life that should be embraced with grace and dignity. We support policies and practices that enable older adults to age in place when possible, maintain their independence, and continue contributing their wisdom and experience to society.' },
  { number: '¶661', title: 'End of Life Care', section: 'Life Issues', current_text: 'We affirm the importance of compassionate care for those facing terminal illness and death. This includes access to hospice care, pain management, emotional and spiritual support, and the right to die with dignity while opposing assisted suicide and euthanasia.' },
  
  // Indigenous Peoples
  { number: '¶670', title: 'Rights of Indigenous Peoples', section: 'Social Justice', current_text: 'We acknowledge the history of colonization and injustice toward indigenous peoples and commit to supporting their rights to self-determination, cultural preservation, and land sovereignty. We seek to learn from indigenous wisdom and work toward healing and reconciliation.' },
  
  // LGBTQ+ (Contemporary Issues)
  { number: '¶680', title: 'Human Sexuality and Identity', section: 'Human Relations', current_text: 'We affirm that all persons are created in Gods image and are of sacred worth. While United Methodists hold diverse views on human sexuality, we commit to treating all persons with dignity, respect, and love, seeking to minister with and to all people regardless of sexual orientation or gender identity.' }
]

async function addDiverseParagraphs() {
  console.log('Adding 50 diverse BoD paragraphs...')
  
  try {
    // Insert all paragraphs
    for (const paragraph of diverseParagraphs) {
      await sql`
        INSERT INTO bod_paragraphs (number, title, section, current_text)
        VALUES (${paragraph.number}, ${paragraph.title}, ${paragraph.section}, ${paragraph.current_text})
      `
    }
    
    console.log(`✅ Successfully added ${diverseParagraphs.length} diverse paragraphs`)
    
    // Verify the count
    const result = await sql`SELECT COUNT(*) as count FROM bod_paragraphs`
    console.log(`📊 Total paragraphs in database: ${result[0].count}`)
    
  } catch (error) {
    console.error('Error adding paragraphs:', error)
    process.exit(1)
  }
}

addDiverseParagraphs()