import { Request, Response } from 'express'
import { getCustomRepository } from 'typeorm'
import { SurveysRepository } from '../repositories/SurveysRepository'
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepotirory'
import { UserRepository } from '../repositories/UserRespository'
import SendMailService from '../services/SendMailService'
import { resolve } from 'path';


class SendMailController{

 async execute ( request: Request, response : Response){
    const { email, survey_id } = request.body

    const usersRepository = getCustomRepository(UserRepository)
    const surveysRepository = getCustomRepository(SurveysRepository)
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository)


    const user = await usersRepository.findOne({email})

    if(!user){
       return response.status(400).json({
          error : "User does not exist"
       })
    }

    const survey = await surveysRepository.findOne({id : survey_id})

    if(!survey){
      return response.status(400).json({
         error : "Survey does not exist"
      })
   }

   const variables = {
      name : user.name,
      tittle : survey.tittle,
      description : survey.description,
      user_id : user.id,
      link : process.env.URL_MAIL
   }

   const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs")

   const surveyUserAlreadyExist = await surveysUsersRepository.findOne({
      where : {user_id : user.id, value : null},
      relations : ["user", "survey"]
   })

   if(surveyUserAlreadyExist){
      await SendMailService.execute(email,survey.tittle, variables, npsPath)
      return response.json(surveyUserAlreadyExist)
   }


   const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id
   })

   await surveysUsersRepository.save(surveyUser)

   //console.log(variables)


   await  SendMailService.execute(email, survey.tittle , variables, npsPath)

   return response.json(surveyUser)


 }}


export { SendMailController }